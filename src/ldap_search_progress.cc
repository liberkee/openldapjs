#include "ldap_search_progress.h"
#include "constants.h"
#include "ldap_control.h"
#include "ldap_helper_function.h"

LDAPSearchProgress::LDAPSearchProgress(Nan::Callback *callback,
                                       Nan::Callback *progress,
                                       const std::shared_ptr<LDAP> &ld,
                                       const int msgID, struct timeval timeOut)
    : Nan::AsyncProgressWorker(callback),
      ld_(ld),
      progress_(progress),
      msgID_(msgID),
      timeOut_(timeOut) {}

LDAPSearchProgress::~LDAPSearchProgress() {}

void LDAPSearchProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  LDAPMessage *l_result{};
  int result{};

  result = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut_,
                       &l_result);

  if (result == constants::LDAP_ERROR) {
    status_ = result;
    return;
  }

  if (result == constants::LDAP_NOT_FINISHED) {
    status_ = LDAP_TIMEOUT;
    return;
  }

  status_ = ldap_result2error(ld_.get(), l_result, false);
  if (status_ != LDAP_SUCCESS) {
    return;
  }

  resultSearch_ = buildsSearchMessage(ld_.get(), l_result);
}

// Executes in event loop
void LDAPSearchProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (status_ != LDAP_SUCCESS) {
    stateClient[0] = Nan::New(status_);
    callback->Call(1, stateClient);
  } else {
    stateClient[1] = Nan::New(resultSearch_).ToLocalChecked();
    callback->Call(2, stateClient);
  }

  callback->Reset();
  progress_->Reset();
}

void LDAPSearchProgress::HandleProgressCallback(const char *data, size_t size) {
  // Required, this is not created automatically
}
