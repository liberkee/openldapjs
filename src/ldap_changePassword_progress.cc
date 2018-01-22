#include "ldap_changePassword_progress.h"
#include <string>
#include "constants.h"

LDAPChangePasswordProgress::LDAPChangePasswordProgress(
    Nan::Callback *callback, Nan::Callback *progress,
    const std::shared_ptr<LDAP> &ld, const int msgID, struct timeval timeOut)
    : Nan::AsyncProgressWorker(callback),
      ld_(ld),
      progress_(progress),
      msgID_(msgID),
      timeOut_(timeOut) {}

void LDAPChangePasswordProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  /* Interval time to the function to verify the message */

  result_ = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut_,
                        &resultMsg_);
}

void LDAPChangePasswordProgress::HandleOKCallback() {
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

  /* Verify the result */
  switch (result_) {
    /* If the result is constants::LDAP_ERROR then we throw the error */
    case constants::LDAP_ERROR: {
      stateClient[0] = Nan::New<v8::Number>(result_);
      callback->Call(1, stateClient);
      break;
    }
    /* If the timeout goes out we send a error of Timeing */
    case constants::LDAP_NOT_FINISHED: {
      stateClient[0] = Nan::New<v8::Number>(LDAP_TIMEOUT);
      callback->Call(1, stateClient);
      break;
    }
    /* If result is LDAP_RES_EXTENDED then we process the operation
     * response */
    case LDAP_RES_EXTENDED: {
      const auto status = ldap_result2error(ld_.get(), resultMsg_, false);
      /* We verify if the operation failed or the operation has made
       * succesfully */
      switch (status) {
        case LDAP_SUCCESS: {
          stateClient[1] = Nan::New<v8::Number>(LDAP_SUCCESS);
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

  callback->Reset();
  progress_->Reset();
}

void LDAPChangePasswordProgress::HandleProgressCallback(const char *data,
                                                        size_t size) {}
