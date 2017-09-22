#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include <string>

class LDAPSearchProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld_{};
  Nan::Callback *progress_{};
  std::string resultSearch_{};
  int msgID_{};
  int status_{};

 public:
  LDAPSearchProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                     const int msgID);

  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  // Executes in event loop
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_
