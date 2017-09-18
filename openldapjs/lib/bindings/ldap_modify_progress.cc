#include "ldap_modify_progress.h"

LDAPModifyProgress::LDAPModifyProgress(Nan::Callback *callback,
                                       Nan::Callback *progress, LDAP *ld,
                                       int msgID, LDAPMod **newEntries)
    : Nan::AsyncProgressWorker(callback),
      progress(progress),
      ld(ld),
      msgID(msgID),
      entries(newEntries) {}

void LDAPModifyProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {0, 1};
  while (result == 0) {
    result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
  }
}

void LDAPModifyProgress::HandleOKCallback() {
  int status;
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

  std::string modifyResult;

  if (result == -1) {
    stateClient[0] = Nan::New<v8::Number>(result);
    callback->Call(1, stateClient);
  } else {
    status = ldap_result2error(ld, resultMsg, 0);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(status);
      callback->Call(1, stateClient);
    } else {
      const auto &ldap_controls =
          new LdapControls();  // does this  need a delete ?
      modifyResult = ldap_controls->PrintModificationControls(ld, resultMsg);
      if (modifyResult != "") {
        stateClient[1] = Nan::New(modifyResult).ToLocalChecked();
        callback->Call(2, stateClient);
      } else {
        stateClient[1] = Nan::New<v8::Number>(0);  // 0 or empty string ?
        callback->Call(2, stateClient);
      }
    }
  }
  callback->Reset();
  progress->Reset();
  ldap_mods_free(entries, 1);
  ldap_msgfree(resultMsg);
}

void LDAPModifyProgress::HandleProgressCallback(const char *data, size_t size) {
}
