#ifndef OPENLDAPJS_SRC_LDAP_COMPARE_PROGRESS_H_
#define OPENLDAPJS_SRC_LDAP_COMPARE_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include <memory>

class LDAPCompareProgress : public Nan::AsyncProgressWorker {
 private:
  const std::shared_ptr<LDAP> ld_{};
  Nan::Callback *progress_{};
  int result_{};
  LDAPMessage *resultMsg_{};
  int msgID_{};
  struct timeval timeOut_{};

 public:
  /**
   **@brief Constructor
   **@param callback, callback used to pass the final result to js
   **@param progress, callback used to pass intermediate results to js
   **@param ld, LDAP structure that holds ldap internal data.
   **@param msgID, operation identifier.
   **@param timeOut, timeval structure that holds the time for operation.
   **/
  LDAPCompareProgress(Nan::Callback *callback, Nan::Callback *progress,
                      const std::shared_ptr<LDAP> &ld, const int msgID,
                      struct timeval timeOut);
  ~LDAPCompareProgress();

  /**
   ** Execute Method, runs outside the event loop.
   **/
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  /**
   ** HandleOkCallback method, gets called when the execute method finishes.
   ** Executes in event loop.
   ** Sends result back to javascript: LDAP_RES_TRUE, LDAP_RES_FALSE or error in
   *case of failure.
   **/
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_SRC_LDAP_COMPARE_PROGRESS_H_
