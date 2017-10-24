#include "ldap_search_progress.h"
#include "ldap_helper_function.h"
#include "constants.h"
#include "ldap_control.h"

LDAPSearchProgress::LDAPSearchProgress(Nan::Callback *callback,
                                       Nan::Callback *progress, LDAP *ld,
                                       const int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID) {
  mapResult_ = std::make_shared<LDAPMapResult>();
}

void LDAPSearchProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ONE_SECOND, constants::ZERO_USECONDS};

  LDAPMessage *l_result{};
  int result{};

  while (result == constants::LDAP_NOT_FINISHED) {
    result =
        ldap_result(ld_, msgID_, constants::ALL_RESULTS, &timeOut, &l_result);
  }
  
  status_ = ldap_result2error(ld_, l_result, false);
  if (status_ != LDAP_SUCCESS) {
    return;
  }

  resultSearch_ = buildsSearchMessage(ld_, l_result);
}

// Executes in event loop
void LDAPSearchProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (status_ != LDAP_SUCCESS) {
    stateClient[0] = Nan::New(status_);
    callback->Call(1, stateClient);
  } else {
    stateClient[1] = Nan::New(mapResult_->ResultLDIFString()).ToLocalChecked();
    callback->Call(2, stateClient);
  }

  callback->Reset();
  progress_->Reset();
}

void LDAPSearchProgress::HandleProgressCallback(const char *data, size_t size) {
  // Required, this is not created automatically
}
