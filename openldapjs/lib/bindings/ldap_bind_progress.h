#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_BIND_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_BIND_PROGRESS_H_

#include <ldap.h>
#include <nan.h>

class LDAPBindProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld_{};
  Nan::Callback *progress_{};
  int result_{};
  LDAPMessage *resultMsg_{};
  int msgID_{};

 public:
  LDAPBindProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                   const int msgID);

  /**
    **@brief Execute Method, runs outside the event loop.
    **@param progress, used to send data back to js during execution, currently
    **unused
    **
    **/
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  /**
   ** HandleOkCallback method, gets called when the execute method finishes.
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

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_BIND_PROGRESS_H_
