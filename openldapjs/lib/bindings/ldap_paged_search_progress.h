#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_PAGED_SEARCH_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_PAGED_SEARCH_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include <map>
#include <memory>
#include <string>

class LDAPPagedSearchProgress : public Nan::AsyncProgressWorker {
 private:
  std::shared_ptr<std::map<std::string, berval *>> cookies_{};
  LDAP *ld_{};
  Nan::Callback *progress_{};
  std::string base_{};
  std::string filter_{};
  int scope_{};
  int pageSize_{};
  std::string pageResult_{};
  int status_{};
  bool morePages_{};
  std::string cookieID_{};

 public:
  /**
  **@brief Constructor
  **@param callback, callback used to pass the final result to js
  **@param progress, callback used to pass intermediate results to js
  **@param ld, LDAP structure that holds ldap internal data.
  **@param base, base of the entry send to server as request to define the start
  **point of search.
  **@param scope, scope for the search, can be BASE, ONE or SUBTREE
  **@param filter, the search filter
  **@param cookieID, ID cookie for the next page
  **@param pgSize, length in entries of a page to be return
  **@param cookies, the berval cookie structure for a page
  **/
  LDAPPagedSearchProgress(
      Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
      std::string base, int scope, std::string filter,
      const std::string &cookieID, int pgSize,
      const std::shared_ptr<std::map<std::string, berval *>> &cookies);

  /**
   **@brief Execute Method, runs outside the event loop.
   **@param progress, used to send data back to js during execution, currently
   **unused
   **
   **/
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  /**
   **@brief HandleOkCallback method, gets called when the execute method
   **finishes. Here we send the response back to js.
   **
   ** Executes in event loop.
   **/
  void HandleOKCallback();

  /**
   **@brief HandleProgressCallback method. Used for sending intermediary data to
   **js
   **@param data, intermediary data
   **@param size, size of the data sent (in bytes).
   **/
  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_PAGED_SEARCH_PROGRESS_H_
