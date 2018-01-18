#include "ldap_extended_operation.h"
#include "constants.h"

LDAPExtendedOperationProgress::LDAPExtendedOperationProgress(
    Nan::Callback *callback, Nan::Callback *progress,
    const std::shared_ptr<LDAP> &ld, const int msgID)
    : Nan::AsyncProgressWorker(callback),
      ld_(ld),
      progress_(progress),
      msgID_(msgID) {}

LDAPExtendedOperationProgress::~LDAPExtendedOperationProgress() {}

void LDAPExtendedOperationProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  /* Interval time to the function to verify the message */
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};

  /* Wait until the result is not LDAP_RES_UNSOLICITED*/
  while (result_ == LDAP_RES_UNSOLICITED) {
    result_ = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut,
                          &resultMsg_);
  }
}

// Executes in worker thread
void LDAPExtendedOperationProgress::HandleOKCallback() {
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

  struct berval *retoidp{};
  /* Verify the result */
  switch (result_) {
    /* If the result is constants::LDAP_ERROR then we throw the error */
    case constants::LDAP_ERROR: {
      stateClient[0] = Nan::New<v8::Number>(result_);
      callback->Call(1, stateClient);
      break;
    }
    /* If result is LDAP_RES_EXTENDED then we process the operation
     * response */
    case LDAP_RES_EXTENDED: {
      const auto status = ldap_result2error(ld_.get(), resultMsg_, false);
      switch (status) {
        case LDAP_SUCCESS: {
          const auto resExt = ldap_parse_extended_result(ld_.get(), resultMsg_,
                                                         nullptr, &retoidp, 0);
          if (resExt != LDAP_SUCCESS) {
            stateClient[0] = Nan::New<v8::Number>(resExt);
            callback->Call(1, stateClient);
            break;
          }
          if (retoidp == nullptr) {
            stateClient[1] = Nan::New<v8::Number>(LDAP_SUCCESS);
            callback->Call(2, stateClient);
            break;
          }
          stateClient[1] = Nan::New(retoidp->bv_val).ToLocalChecked();
          callback->Call(2, stateClient);
          break;
        }
        default: {
          stateClient[0] = Nan::New<v8::Number>(status);
          callback->Call(1, stateClient);
        }
      }
      break;
    }
    /* If the result give other then LDAP_RES_EXTENDED and constants::LDAP_ERROR
     * we throw the constants::LDAP_ERROR */
    default: {
      stateClient[0] = Nan::New<v8::Number>(constants::LDAP_ERROR);
      callback->Call(1, stateClient);
    }
  }

  delete retoidp;
  callback->Reset();
  ldap_msgfree(resultMsg_);
  progress_->Reset();
}

void LDAPExtendedOperationProgress::HandleProgressCallback(const char *data,
                                                           size_t size) {}