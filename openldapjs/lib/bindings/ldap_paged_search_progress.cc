#include "ldap_paged_search_progress.h"

LDAPPagedSearchProgress::LDAPPagedSearchProgress(
    Callback *callback, Callback *progress, LDAP *ld, std::string base,
    int scope, std::string filter, const std::string &cookieID, int pgSize,
    const std::shared_ptr<std::map<std::string, berval *>> &cookies)
    : AsyncProgressWorker(callback), progress(progress), ld(ld), base(base),
      scope(scope), filter(filter), cookieID(cookieID), pageSize(pgSize),
      cookies(cookies) {
  // cookie != NULL ?
  // cout<<"-------------length--------"<<cookie->bv_len<<endl: cout<<"cookie
  // is null"<<endl;
}
// Executes in worker thread
void LDAPPagedSearchProgress::Execute(
    const AsyncProgressWorker::ExecutionProgress &progress) {
        
  BerElement *ber;
  int l_rc, l_entries, l_entry_count = 0, l_errcode = 0, page_nbr;
  char pagingCriticality = 'T', *l_dn;
  int totalCount = 0;
  LDAPControl *pageControl = nullptr;
  LDAPControl *M_controls[2] = {nullptr, nullptr};
  LDAPControl **returnedControls = nullptr;
  LDAPMessage *l_result, *l_entry;
  int msgId = 0;
  char *attribute;
  char **values;
  /*                                                                */
  /******************************************************************/

  page_nbr = 1;

  /******************************************************************/
  /* Get one page of the returned results each time                 */
  /* through the loop                                               */
  // do
  {
    pageResult += "\n";

    l_rc = ldap_create_page_control(ld, pageSize, (*cookies)[cookieID],
                                    pagingCriticality, &pageControl);

    /* Insert the control into a list to be passed to the search.     */
    M_controls[0] = pageControl;

    /* Search for entries in the directory using the parmeters.       */

    l_rc = ldap_search_ext(ld, base.c_str(), scope, filter.c_str(), nullptr, 0,
                           M_controls, nullptr, nullptr, 0, &msgId);

    if ((l_rc != LDAP_SUCCESS)) {
      status = -1;

      // break;
      return;
    }

    int pagedResult = 0;
    struct timeval timeOut = {1, 0};
    while (pagedResult == 0) {
      pagedResult = ldap_result(ld, msgId, 1, &timeOut, &l_result);
    }

    /* Parse the results to retrieve the contols being returned.      */

    l_rc = ldap_parse_result(ld, l_result, &l_errcode, nullptr, nullptr,
                             nullptr, &returnedControls, false);

    if ((*cookies)[cookieID] != nullptr) {
      ber_bvfree((*cookies)[cookieID]);
      (*cookies)[cookieID] = nullptr;
    }

    /* Parse the page control returned to get the cookie and          */
    /* determine whether there are more pages.                        */

    l_rc = ldap_parse_page_control(ld, returnedControls, &totalCount,
                                   &(*cookies)[cookieID]);

    /* Determine if the cookie is not empty, indicating there are more pages
     */
    /* for these search parameters. */
    if ((*cookies)[cookieID] && (*cookies)[cookieID]->bv_val != nullptr &&
        (strlen((*cookies)[cookieID]->bv_val) > 0)) {
      morePages = true;
    } else {
      morePages = false;
    }

    /* Cleanup the controls used. */
    if (returnedControls != nullptr) {
      ldap_controls_free(returnedControls);
      returnedControls = nullptr;
    }
    M_controls[0] = nullptr;
    ldap_control_free(pageControl);
    pageControl = nullptr;

    /******************************************************************/
    /* Disply the returned result                                     */
    /*                                                                */
    /* Determine how many entries have been found.                    */
    if (morePages == true)

      l_entries = ldap_count_entries(ld, l_result);

    if (l_entries > 0) {
      l_entry_count = l_entry_count + l_entries;
    }

    for (l_entry = ldap_first_entry(ld, l_result); l_entry != nullptr;
         l_entry = ldap_next_entry(ld, l_entry)) {
      l_dn = ldap_get_dn(ld, l_entry);
      pageResult += "dn: ";
      pageResult += l_dn;
      pageResult += "\n";

      for (attribute = ldap_first_attribute(ld, l_entry, &ber);
           attribute != nullptr;
           attribute = ldap_next_attribute(ld, l_entry, ber)) {
        if ((values = ldap_get_values(ld, l_entry, attribute)) != nullptr) {
          for (int i = 0; values[i] != nullptr; i++) {
            pageResult += attribute;
            pageResult += ":";
            pageResult += values[i];
            pageResult += "\n";
          }
          ldap_value_free(values);
        }
        ldap_memfree(attribute);
      }
      pageResult += "\n";
    }


    /* Free the search results.                                       */
    ldap_msgfree(l_result);
    page_nbr += 1;
    pageResult += "---------";
    pageResult += std::to_string(page_nbr);
    pageResult += "------\n";
  }
  /* Free the cookie since all the pages for these search parameters   */
  /* have been retrieved.                                              */
}

// Executes in event loop


void LDAPPagedSearchProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[3] = {Nan::Null(), Nan::Null(), Nan::Null()};
  if (status != LDAP_SUCCESS) {
    stateClient[0] = Nan::New(status);
    callback->Call(1, stateClient);
  } else {

    stateClient[1] = Nan::New(pageResult).ToLocalChecked();

    morePages == true ? stateClient[2] = Nan::True() : stateClient[2] =
                                                           Nan::False();

    callback->Call(3, stateClient);
  }

  // ldap_msgfree(resultMsg);
  callback->Reset();
  progress->Reset();
}

void LDAPPagedSearchProgress::HandleProgressCallback(const char *data,
                                                     size_t size) {
  // Required, this is not created automatically
}