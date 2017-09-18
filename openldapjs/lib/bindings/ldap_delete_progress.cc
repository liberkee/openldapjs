#include "ldap_delete_progress.h"
#include <string>
#include "constants.h"
#include "ldap_control.h"

LDAPDeleteProgress::LDAPDeleteProgress(Nan::Callback *callback,
                                       Nan::Callback *progress, LDAP *ld,
                                       int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID) {}

// Executes in worker thread
void LDAPDeleteProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};
  while (result_ == 0) {
    result_ =
        ldap_result(ld_, msgID_, constants::ALL_RESULTS, &timeOut, &resultMsg_);
  }
}

void LDAPDeleteProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  std::string deleteResult;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (result_ == constants::LDAP_ERROR) {
    stateClient[0] = Nan::New<v8::Number>(result_);
    callback->Call(1, stateClient);
  } else {
    int status = ldap_result2error(ld_, resultMsg_, 0);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(status);
      callback->Call(1, stateClient);
    } else {
      const auto &ldap_controls = new LdapControls();
      deleteResult = ldap_controls->PrintModificationControls(ld_, resultMsg_);
      if (!deleteResult.empty()) {
        stateClient[1] = Nan::New(deleteResult).ToLocalChecked();
        callback->Call(2, stateClient);
      } else {
        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
    }
  }
  callback->Reset();
  progress_->Reset();
  ldap_msgfree(resultMsg_);
}

void LDAPDeleteProgress::HandleProgressCallback(const char *data, size_t size) {
  // progress.send what ?
}
