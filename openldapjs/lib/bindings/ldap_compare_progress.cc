#include "ldap_compare_progress.h"

LDAPCompareProgress::LDAPCompareProgress(Nan::Callback *callback,
                                         Nan::Callback *progress, LDAP *ld,
                                         int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress(progress),
      ld(ld),
      msgID(msgID) {}

// Executes in worker thread
void LDAPCompareProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {0, 1};

  while (result == 0) {
    result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
    progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
  }
}
// Executes in event loop
void LDAPCompareProgress::HandleOKCallback() {
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (result == -1) {
    stateClient[1] = Nan::New("The Comparison Result: false").ToLocalChecked();
    callback->Call(2, stateClient);
  } else {
    int status = ldap_result2error(ld, resultMsg, 0);
    if (status == LDAP_COMPARE_TRUE || status == LDAP_COMPARE_FALSE) {
      if (status == LDAP_COMPARE_TRUE) {
        stateClient[1] =
            Nan::New("The Comparison Result: true").ToLocalChecked();
      } else {
        stateClient[1] =
            Nan::New("The Comparison Result: false").ToLocalChecked();
      }
      callback->Call(2, stateClient);
    } else {
      // Return ERROR
      stateClient[0] = Nan::New(status);
      callback->Call(1, stateClient);
    }
  }
}
}

void LDAPCompareProgress::HandleProgressCallback(const char *data,
                                                 size_t size) {
  // Required, this is not created automatically
  Nan::HandleScope scope;
  v8::Local<v8::Value> argv[] = {
      Nan::New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
  progress->Call(1, argv);
}
