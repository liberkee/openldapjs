#include "ldap_extended_operation.h"
#include "constants.h"
#include <string>


LDAPExtendedOperationProgress::LDAPExtendedOperationProgress(Nan::Callback *callback,
                                         Nan::Callback *progress,
                                         const std::shared_ptr<LDAP> &ld,
                                         const int msgID)
    : Nan::AsyncProgressWorker(callback),
      ld_(ld),
      progress_(progress),
      msgID_(msgID) {}

LDAPExtendedOperationProgress::~LDAPExtendedOperationProgress() {}

// Executes in worker thread
void LDAPExtendedOperationProgress::Execute(
  const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};

  while (result_ == constants::LDAP_NOT_FINISHED) {
    result_ = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut,
                          &resultMsg_);
  }
}
// Executes in event loop
void LDAPExtendedOperationProgress::HandleOKCallback() {
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  struct berval *retdatap{};
  int stats{};
  if (result_ == constants::LDAP_ERROR) {
    stateClient[0] = Nan::New(result_);
    callback->Call(1, stateClient);
  } else {
    const auto status = ldap_result2error(ld_.get(), resultMsg_, false);
    if (status != LDAP_SUCCESS) {
      stateClient[0] = Nan::New(status);
      callback->Call(1, stateClient);
    } else {
      stats = ldap_parse_extended_result(ld_.get(), resultMsg_, NULL, &retdatap, 0);
      if(stats != LDAP_SUCCESS) {
        stateClient[0] = Nan::New(stats);
        callback->Call(1, stateClient);
      } else {
        resultExtOP_ = retdatap->bv_val;
        stateClient[1] = Nan::New(resultExtOP_).ToLocalChecked();
        callback->Call(2, stateClient);

      }
    }
  }
  delete retdatap;
  callback->Reset();
  ldap_msgfree(resultMsg_);
  progress_->Reset();
}

void LDAPExtendedOperationProgress::HandleProgressCallback(const char *data,
                                                 size_t size) {}
