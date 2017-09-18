#include "ldap_add_progress.h"
#include "ldap_control.h"
#include "string"
#include "constants.h"

LDAPAddProgress::LDAPAddProgress(Nan::Callback *callback,
                                 Nan::Callback *progress, LDAP *ld, int msgID,
                                 LDAPMod **newEntries)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID),
      entries_(newEntries) {}

void LDAPAddProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};

  while (result_ == 0) {
    result_ = ldap_result(ld_, msgID_, 1, &timeOut, &resultMsg_);
  }
}

void LDAPAddProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  std::string addResult;
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
      const auto &ldap_controls = new LdapControls();
      addResult = ldap_controls->PrintModificationControls(ld_, resultMsg_);
      if (addResult != "") {
        stateClient[1] = Nan::New(addResult).ToLocalChecked();
        callback->Call(2, stateClient);

      } else {
        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
    }
  }
  ldap_msgfree(resultMsg_);
  ldap_mods_free(entries_, 1);
  callback->Reset();
  progress_->Reset();
}

void LDAPAddProgress::HandleProgressCallback(const char *data, size_t size) {}
