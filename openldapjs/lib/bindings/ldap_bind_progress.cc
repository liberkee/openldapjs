#include "ldap_bind_progress.h"

LDAPBindProgress::LDAPBindProgress(Nan::Callback *callback,
                                   Nan::Callback *progress, LDAP *ld, int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress(progress),
      ld(ld),
      msgID(msgID) {}

/**
** Execute Method, runs outside the event loop.
**/
void LDAPBindProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {0, 1};
  while (result == 0) {
    result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
  }
}

/**
** HandleOkCallback method, gets called when the execute method finishes.
**/
void LDAPBindProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (result == -1) {
    stateClient[0] = Nan::New<v8::Number>(result);
    callback->Call(1, stateClient);
  } else {
    int status = ldap_result2error(ld, resultMsg, 0);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(status);
      callback->Call(1, stateClient);
    } else {
      stateClient[1] =
          Nan::New<v8::Number>(2);  // any sense in providing 2 for bound ?..
      callback->Call(2, stateClient);
    }
  }
  ldap_msgfree(resultMsg);  // this was missing, added it recently
  callback->Reset();
  progress->Reset();
}

void LDAPBindProgress::HandleProgressCallback(const char *data, size_t size) {}
