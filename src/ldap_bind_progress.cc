#include "ldap_bind_progress.h"
#include "constants.h"

LDAPBindProgress::LDAPBindProgress(Nan::Callback *callback,
                                   Nan::Callback *progress, LDAP *ld,
                                   const int msgID, struct timeval timeOut)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID),
      timeOut_(timeOut) {}

/**
** Execute Method, runs outside the event loop.
**/
void LDAPBindProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
    result_ =
        ldap_result(ld_, msgID_, constants::ALL_RESULTS, &timeOut_, &resultMsg_);
}

/**
** HandleOkCallback method, gets called when the execute method finishes.
**/
void LDAPBindProgress::HandleOKCallback() {
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (result_ == constants::LDAP_ERROR || result_ == constants::LDAP_NOT_FINISHED) {
    stateClient[0] = Nan::New<v8::Number>(result_);
    callback->Call(1, stateClient);
  } else {
    const auto status = ldap_result2error(ld_, resultMsg_, false);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(status);
      callback->Call(1, stateClient);
    } else {
      stateClient[1] = Nan::New<v8::Number>(constants::BIND_STATE);
      callback->Call(2, stateClient);
    }
  }
  ldap_msgfree(resultMsg_);
  callback->Reset();
  progress_->Reset();
}

void LDAPBindProgress::HandleProgressCallback(const char *data, size_t size) {}
