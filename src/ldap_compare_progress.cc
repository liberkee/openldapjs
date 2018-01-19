#include "ldap_compare_progress.h"
#include "constants.h"

LDAPCompareProgress::LDAPCompareProgress(Nan::Callback *callback,
                                         Nan::Callback *progress,
                                         const std::shared_ptr<LDAP> &ld,
                                         const int msgID,
                                         struct timeval timeOut)
    : Nan::AsyncProgressWorker(callback),
      ld_(ld),
      progress_(progress),
      msgID_(msgID),
      timeOut_(timeOut) {}

LDAPCompareProgress::~LDAPCompareProgress() {}

// Executes in worker thread
void LDAPCompareProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  result_ = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut_,
                        &resultMsg_);
}
// Executes in event loop
void LDAPCompareProgress::HandleOKCallback() {
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

  switch (result_) {
    case constants::LDAP_ERROR: {
      stateClient[0] = Nan::New<v8::Number>(result_);
      callback->Call(1, stateClient);
      break;
    }
    case constants::LDAP_NOT_FINISHED: {
      stateClient[0] = Nan::New<v8::Number>(LDAP_TIMEOUT);
      callback->Call(1, stateClient);
      break;
    }
    case LDAP_RES_COMPARE: {
      const auto status = ldap_result2error(ld_.get(), resultMsg_, false);
      if (status == LDAP_COMPARE_TRUE || status == LDAP_COMPARE_FALSE) {
        stateClient[1] = Nan::New(status);
        callback->Call(2, stateClient);
        break;
      }
      stateClient[0] = Nan::New(status);
      callback->Call(1, stateClient);
      break;
    }
    default: {
      stateClient[0] = Nan::New<v8::Number>(constants::LDAP_ERROR);
      callback->Call(1, stateClient);
    }
  }
  callback->Reset();
  ldap_msgfree(resultMsg_);
  progress_->Reset();
}

void LDAPCompareProgress::HandleProgressCallback(const char *data,
                                                 size_t size) {}
