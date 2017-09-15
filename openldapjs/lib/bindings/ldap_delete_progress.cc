#include "ldap_delete_progress.h"

LDAPDeleteProgress::LDAPDeleteProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
  int msgID)
: Nan::AsyncProgressWorker(callback),
progress(progress),
ld(ld),
msgID(msgID) {}


 // Executes in worker thread
 void LDAPDeleteProgress::Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {0, 1};
  while (result == 0) {
    result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
  }
}

void LDAPDeleteProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  std::string deleteResult;
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
      const auto &ldap_controls = new LdapControls();
      deleteResult = ldap_controls->PrintModificationControls(ld, resultMsg);
      if (deleteResult != "") {
        stateClient[1] = Nan::New(deleteResult).ToLocalChecked();
        callback->Call(2, stateClient);
      } else {
        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
    }
  }
  callback->Reset();
  progress->Reset();
  ldap_msgfree(resultMsg);
}

void LDAPDeleteProgress::HandleProgressCallback(const char *data, size_t size) {
  // progress.send what ?
}

