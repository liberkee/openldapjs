#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_COMPARE_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_COMPARE_PROGRESS_H_

#include <ldap.h>
#include <nan.h>

class LDAPCompareProgress : public Nan::AsyncProgressWorker {
 private:
  const std::shared_ptr<LDAP> ld_{};
  Nan::Callback *progress_{};
  int result_{};
  LDAPMessage *resultMsg_{};
  int msgID_{};

 public:
  /**
   **@brief Constructor
   **@param callback, callback used to pass the final result to js
   **@param progress, callback used to pass intermediate results to js
   **@param ld, LDAP structure that holds ldap internal data.
   **@param msgID, operation identifier.
   **/
  LDAPCompareProgress(Nan::Callback *callback, Nan::Callback *progress,
                      std::shared_ptr<LDAP> ld, const int msgID);
  ~LDAPCompareProgress();

  /**
   ** Execute Method, runs outside the event loop.
   **/
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  /**
   ** HandleOkCallback method, gets called when the execute method finishes.
   ** Executes in event loop.
   **/
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_COMPARE_PROGRESS_H_
