#include "ldap_paged_search_progress.h"
#include "constants.h"
#include "ldap_helper_function.h"

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
  int l_entries{};
  int l_entry_count{};
  int l_errcode{};
  int pagedResult{};
  char pagingCriticality = 'T';
  int totalCount{};
  LDAPControl *pageControl = nullptr;
  LDAPControl *M_controls[2] = {nullptr, nullptr};
  LDAPControl **returnedControls = nullptr;
  LDAPMessage *l_result{};
  int msgId{};
  struct timeval timeOut = {constants::ONE_SECOND, constants::ZERO_USECONDS};

  /******************************************************************/
  /* Get one page of the returned results each time                 */
  status_ = ldap_create_page_control(ld_, pageSize_, (*cookies_)[cookieID_],
                                     pagingCriticality, &pageControl);
  if (status_ != LDAP_SUCCESS) {
    return;
  }
  /* Insert the control into a list to be passed to the search.     */
  M_controls[0] = pageControl;

  /* Search for entries in the directory using the parmeters.       */

  status_ = ldap_search_ext(ld_, base_.c_str(), scope_, filter_.c_str(),
                            nullptr, constants::ATTR_VALS_WANTED, M_controls,
                            nullptr, nullptr, LDAP_NO_LIMIT, &msgId);

  if ((status_ != LDAP_SUCCESS)) {
    return;
  }

  while (pagedResult == constants::LDAP_NOT_FINISHED) {
    pagedResult =
        ldap_result(ld_, msgId, constants::ALL_RESULTS, &timeOut, &l_result);
  }
  /**
  ** Check for errors and return
  **/
  if (pagedResult != LDAP_RES_SEARCH_RESULT) {
    status_ = pagedResult;
    return;
  }

  /* Add the verification in case of error and return the result in status_ */
  status_ = ldap_result2error(ld_, l_result, false);
  if (status_ != LDAP_SUCCESS) {
    return;
  }

  /* Parse the results to retrieve the controls being returned.      */

  status_ = ldap_parse_result(ld_, l_result, &l_errcode, nullptr, nullptr,
                              nullptr, &returnedControls, false);
  if ((status_ != LDAP_SUCCESS)) {
    return;
  }

  if ((*cookies_)[cookieID_] != nullptr) {
    ber_bvfree((*cookies_)[cookieID_]);
    (*cookies_)[cookieID_] = nullptr;
  }
  /* Parse the page control returned to get the cookie and          */
  /* determine whether there are more pages.                        */

  status_ = ldap_parse_page_control(ld_, returnedControls, &totalCount,
                                    &(*cookies_)[cookieID_]);
  if ((status_ != LDAP_SUCCESS)) {
    return;
  }

  /* Determine if the cookie is not empty, indicating there are more pages
   *
   * for these search parameters. */

  if ((*cookies_)[cookieID_]->bv_len == 0) {
    morePages_ = false;
  } else {
    morePages_ = true;
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
  if (morePages_ == true) {
    l_entries = ldap_count_entries(ld_, l_result);
  }
  if (l_entries > 0) {
    l_entry_count = l_entry_count + l_entries;
  }

  pageResult_ = buildsSearchMessage(ld_, l_result);
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
