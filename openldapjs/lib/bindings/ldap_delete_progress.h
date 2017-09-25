#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_DELETE_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_DELETE_PROGRESS_H_

#include <ldap.h>
#include <nan.h>

class LDAPDeleteProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld_{};
  Nan::Callback *progress_{};
  int result_{};
  LDAPMessage *resultMsg_{};
  int msgID_{};

 public:
  LDAPDeleteProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                     const int msgID);

  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  // Executes in event loop
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_DELETE_PROGRESS_H_
