#include "ldap_bind_progress.h"
#include "constants.h"

LDAPBindProgress::LDAPBindProgress(Nan::Callback *callback,
                                   Nan::Callback *progress, LDAP *ld, int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID) {}

/**
** Execute Method, runs outside the event loop.
**/
void LDAPBindProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};
  while (result_ == 0) {
    result_ =
        ldap_result(ld_, msgID_, constants::ALL_RESULTS, &timeOut, &resultMsg_);
  }
}

/**
** HandleOkCallback method, gets called when the execute method finishes.
**/
void LDAPBindProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (result_ == -1) {
    stateClient[0] = Nan::New<v8::Number>(result_);
    callback->Call(1, stateClient);
  } else {
    int status = ldap_result2error(ld_, resultMsg_, 0);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(status);
      callback->Call(1, stateClient);
    } else {
      stateClient[1] =
          Nan::New<v8::Number>(2);  // any sense in providing 2 for bound ?..
      callback->Call(2, stateClient);
    }
  }
  ldap_msgfree(resultMsg_);  // this was missing, added it recently
  callback->Reset();
  progress_->Reset();
}

void LDAPBindProgress::HandleProgressCallback(const char *data, size_t size) {}
