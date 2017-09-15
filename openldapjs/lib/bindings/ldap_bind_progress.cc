#include "ldap_bind_progress.h"

LDAPBindProgress::LDAPBindProgress(Callback *callback, Callback *progress,
                                   LDAP *ld, int msgID)
    : AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID) {}

/**
** Execute Method, runs outside the event loop.
**/
void LDAPBindProgress::Execute(
    const AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {0, 1};
  while (result == 0) {
    result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
  }
}

/**
** HandleOkCallback method, gets called when the execute method finishes.
**/
void LDAPBindProgress::HandleOKCallback() {
  Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (result == -1) {
    stateClient[0] = Nan::New<Number>(0);
    callback->Call(1, stateClient);
  } else {
    int status = ldap_result2error(ld, resultMsg, 0);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
    } else {
      stateClient[1] = Nan::New<Number>(2);
      callback->Call(2, stateClient);
    }
  }
}

void LDAPBindProgress::HandleProgressCallback(const char *data, size_t size) {}
