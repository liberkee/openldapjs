#include "ldap_paged_search_progress.h"

LDAPPagedSearchProgress::LDAPPagedSearchProgress(
    Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
    std::string base, int scope, std::string filter,
    const std::string &cookieID, int pgSize,
    const std::shared_ptr<std::map<std::string, berval *>> &cookies)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      base_(base),
      scope_(scope),
      filter_(filter),
      cookieID_(cookieID),
      pageSize_(pgSize),
      cookies_(cookies) {}

// Executes in worker thread
void LDAPPagedSearchProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  BerElement *ber{};
  int l_rc{};
  int l_entries{};
  int l_entry_count = 0;
  int l_errcode = 0;
  int page_nbr{};
  char pagingCriticality = 'T';
  char *l_dn{};
  int totalCount = 0;
  LDAPControl *pageControl = nullptr;
  LDAPControl *M_controls[2] = {nullptr, nullptr};
  LDAPControl **returnedControls = nullptr;
  LDAPMessage *l_result{};
  LDAPMessage *l_entry{};
  int msgId = 0;
  char *attribute{};
  char **values{};
  /*                                                                */
  /******************************************************************/

  page_nbr = 1;

  /******************************************************************/
  /* Get one page of the returned results each time                 */
  /* through the loop                                               */
  // do
  {
    pageResult_ += "\n";

    l_rc = ldap_create_page_control(ld_, pageSize_, (*cookies_)[cookieID_],
                                    pagingCriticality, &pageControl);

    /* Insert the control into a list to be passed to the search.     */
    M_controls[0] = pageControl;

    /* Search for entries in the directory using the parmeters.       */

    l_rc = ldap_search_ext(ld_, base_.c_str(), scope_, filter_.c_str(), nullptr,
                           0, M_controls, nullptr, nullptr, 0, &msgId);

    if ((l_rc != LDAP_SUCCESS)) {
      // ldap_err2string(l_rc)
      status_ = l_rc;
      return;
    }

    int pagedResult = 0;
    struct timeval timeOut = {1, 0};
    while (pagedResult == 0) {
      pagedResult = ldap_result(ld_, msgId, 1, &timeOut, &l_result);
    }

    /* Parse the results to retrieve the contols being returned.      */

    l_rc = ldap_parse_result(ld_, l_result, &l_errcode, nullptr, nullptr,
                             nullptr, &returnedControls, false);

    if ((*cookies_)[cookieID_] != nullptr) {
      ber_bvfree((*cookies_)[cookieID_]);
      (*cookies_)[cookieID_] = nullptr;
    }

    /* Parse the page control returned to get the cookie and          */
    /* determine whether there are more pages.                        */

    l_rc = ldap_parse_page_control(ld_, returnedControls, &totalCount,
                                   &(*cookies_)[cookieID_]);

    /* Determine if the cookie is not empty, indicating there are more pages
     */
    /* for these search parameters. */
    if ((*cookies_)[cookieID_] && (*cookies_)[cookieID_]->bv_val != 0 &&
        (strlen((*cookies_)[cookieID_]->bv_val) > 0)) {
      morePages_ = true;
    } else {
      morePages_ = false;
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
    /* Build the result string                                        */
    /*                                                                */
    /* Determine how many entries have been found.                    */
    if (morePages_ == true) l_entries = ldap_count_entries(ld_, l_result);

    if (l_entries > 0) {
      l_entry_count = l_entry_count + l_entries;
    }

    for (l_entry = ldap_first_entry(ld_, l_result); l_entry != nullptr;
         l_entry = ldap_next_entry(ld_, l_entry)) {
      l_dn = ldap_get_dn(ld_, l_entry);
      pageResult_ += "dn: ";
      pageResult_ += l_dn;
      pageResult_ += "\n";
      ldap_memfree(l_dn);

      for (attribute = ldap_first_attribute(ld_, l_entry, &ber);
           attribute != nullptr;
           attribute = ldap_next_attribute(ld_, l_entry, ber)) {
        if ((values = ldap_get_values(ld_, l_entry, attribute)) != nullptr) {
          for (int i = 0; values[i] != nullptr; i++) {
            pageResult_ += attribute;
            pageResult_ += ":";
            pageResult_ += values[i];
            pageResult_ += "\n";
          }
          ldap_value_free(values);
        }
        ldap_memfree(attribute);
      }
      ber_free(ber, 0);
      pageResult_ += "\n";
    }

    /* Free the search results.                                       */
    ldap_msgfree(l_result);
    // page_nbr += 1;
    pageResult_ += "---------";
    // pageResult_ += std::to_string(page_nbr);
    pageResult_ += "------\n";
  }
}

// Executes in event loop

void LDAPPagedSearchProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[3] = {Nan::Null(), Nan::Null(), Nan::Null()};
  if (status_ != LDAP_SUCCESS) {
    stateClient[0] = Nan::New(status_);
    callback->Call(1, stateClient);
  } else {
    stateClient[1] = Nan::New(pageResult_).ToLocalChecked();

    morePages_ ? stateClient[2] = Nan::True() : stateClient[2] = Nan::False();

    callback->Call(3, stateClient);
  }

  callback->Reset();
  progress_->Reset();
}

void LDAPPagedSearchProgress::HandleProgressCallback(const char *data,
                                                     size_t size) {
  // Required, this is not created automatically
}