#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include<string>

class LDAPSearchProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld{};
  Nan::Callback *progress{};
  int result = 0;
  int finished = 0;
  std::string resultSearch{};
  int msgID{};
  int status = 0;

 public:
  LDAPSearchProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                     int msgID);

  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  // Executes in event loop
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_
