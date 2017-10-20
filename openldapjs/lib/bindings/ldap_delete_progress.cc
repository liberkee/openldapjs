#include "ldap_delete_progress.h"
#include <string>
#include "constants.h"
#include "ldap_control.h"

LDAPDeleteProgress::LDAPDeleteProgress(Nan::Callback *callback,
                                       Nan::Callback *progress,
                                       std::shared_ptr<LDAP> ld,
                                       const int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID) {}

LDAPDeleteProgress::~LDAPDeleteProgress() {}

// Executes in worker thread
void LDAPDeleteProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};
  while (result_ == constants::LDAP_NOT_FINISHED) {
    result_ = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut,
                          &resultMsg_);
  }
}

void LDAPDeleteProgress::HandleOKCallback() {
  std::string deleteResult;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (result_ == constants::LDAP_ERROR) {
    stateClient[0] = Nan::New<v8::Number>(result_);
    callback->Call(1, stateClient);
  } else {
    int status = ldap_result2error(ld_.get(), resultMsg_, false);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(status);
      callback->Call(1, stateClient);
    } else {
      const auto &ldap_controls = new LdapControls();
      deleteResult =
          ldap_controls->PrintModificationControls(ld_.get(), resultMsg_);
      if (!deleteResult.empty()) {
        stateClient[1] = Nan::New(deleteResult).ToLocalChecked();
        callback->Call(2, stateClient);
      } else {
        stateClient[1] = Nan::New<v8::Number>(LDAP_SUCCESS);
        callback->Call(2, stateClient);
      }
      delete ldap_controls;
    }
  }
  callback->Reset();
  progress_->Reset();
  ldap_msgfree(resultMsg_);
}

void LDAPDeleteProgress::HandleProgressCallback(const char *data, size_t size) {
  // progress.send what ?
}
