#include "ldap_add_progress.h"

LDAPAddProgress::LDAPAddProgress(Nan::Callback *callback,
                                 Nan::Callback *progress, LDAP *ld, int msgID,
                                 LDAPMod **newEntries)
    : Nan::AsyncProgressWorker(callback),
      progress(progress),
      ld(ld),
      msgID(msgID),
      entries(newEntries) {}

void LDAPAddProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {0, 1};

  while (result == 0) {
    result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
  }
}

void LDAPAddProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  std::string addResult;
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
      addResult = ldap_controls->PrintModificationControls(ld, resultMsg);
      if (addResult != "") {
        stateClient[1] = Nan::New(addResult).ToLocalChecked();
        callback->Call(2, stateClient);

      } else {
        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
    }
  }
  ldap_msgfree(resultMsg);
  ldap_mods_free(entries, 1);
  callback->Reset();
  progress->Reset();
}

void LDAPAddProgress::HandleProgressCallback(const char *data, size_t size) {}
