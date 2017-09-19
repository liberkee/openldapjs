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
  LDAP *ld_;
  Nan::Callback *progress_;
  std::string base_;
  std::string filter_;
  int scope_;
  int pageSize_;
  std::string pageResult_;
  int status_ = 0;
  bool morePages_ = true;
  std::string cookieID_;

 public:
  LDAPPagedSearchProgress(
      Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
      std::string base, int scope, std::string filter,
      const std::string &cookieID, int pgSize,
      const std::shared_ptr<std::map<std::string, berval *>> &cookies);

  /**
  **Executes in worker thread
  **All results from the search are retrieved and build into a ldif format in
  **this function
  **/
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  /** Executes in event loop
   ** Passes the response back to javascript
   **/
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_PAGED_SEARCH_PROGRESS_H_
