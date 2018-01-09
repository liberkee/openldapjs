#ifndef OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATION_PROGRESS_H_
#define OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATION_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include <memory>

class LDAPExtendedOperationProgress : public Nan::AsyncProgressWorker {
 private:
  const std::shared_ptr<LDAP> ld_{};
  Nan::Callback *progress_{};
  int result_{};
  LDAPMessage *resultMsg_{};
  int msgID_{};
  std::string resultExtOP_{};

 public:
  /**
   **@brief Constructor
   **@param callback, callback used to pass the final result to js
   **@param progress, callback used to pass intermediate results to js
   **@param ld, LDAP structure that holds ldap internal data.
   **@param msgID, operation identifier.
   **/
  LDAPExtendedOperationProgress(Nan::Callback *callback, Nan::Callback *progress,
                      const std::shared_ptr<LDAP> &ld, const int msgID);
  ~LDAPExtendedOperationProgress();

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

#endif  // OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATION_PROGRESS_H_
