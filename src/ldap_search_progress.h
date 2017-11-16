#ifndef OPENLDAPJS_SRC_LDAP_SEARCH_PROGRESS_H_
#define OPENLDAPJS_SRC_LDAP_SEARCH_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include <memory>
#include <string>

class LDAPSearchProgress : public Nan::AsyncProgressWorker {
 private:
  const std::shared_ptr<LDAP> ld_{};
  Nan::Callback *progress_{};
  std::string resultSearch_{};
  int msgID_{};
  int status_{};

 public:
  /**
   **@brief Constructor
   **@param callback, callback used to pass the final result to js
   **@param progress, callback used to pass intermediate results to js
   **@param ld, LDAP structure that holds ldap internal data.
   **@param msgID, operation identifier.
   **/
  LDAPSearchProgress(Nan::Callback *callback, Nan::Callback *progress,
                     const std::shared_ptr<LDAP> &ld, const int msgID);
  ~LDAPSearchProgress();

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

#endif  // OPENLDAPJS_SRC_LDAP_SEARCH_PROGRESS_H_