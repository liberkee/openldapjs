#include "ldap_add_progress.h"
#include "ldap_control.h"
#include "string"
#include "constants.h"

LDAPAddProgress::LDAPAddProgress(Nan::Callback *callback,
                                 Nan::Callback *progress, LDAP *ld, int msgID,
                                 LDAPMod **newEntries)
    : Nan::AsyncProgressWorker(callback),
      _progress(progress),
      _ld(ld),
      _msgID(msgID),
      _entries(newEntries) {}

void LDAPAddProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};

  while (_result == 0) {
    _result = ldap_result(_ld, _msgID, 1, &timeOut, &_resultMsg);
  }
}

void LDAPAddProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  std::string addResult;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (_result == -1) {
    stateClient[0] = Nan::New<v8::Number>(_result);
    callback->Call(1, stateClient);
  } else {
    int status = ldap_result2error(_ld, _resultMsg, 0);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(status);
      callback->Call(1, stateClient);
    } else {
      const auto &ldap_controls = new LdapControls();
      addResult = ldap_controls->PrintModificationControls(_ld, _resultMsg);
      if (addResult != "") {
        stateClient[1] = Nan::New(addResult).ToLocalChecked();
        callback->Call(2, stateClient);

      } else {
        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
    }
  }
  ldap_msgfree(_resultMsg);
  ldap_mods_free(_entries, 1);
  callback->Reset();
  _progress->Reset();
}

void LDAPAddProgress::HandleProgressCallback(const char *data, size_t size) {}
