#include "./ldap_changePassword_progress.h"
#include <iostream>
#include <string>
#include "./constants.h"

LDAPChangePasswordProgress::LDAPChangePasswordProgress(Nan::Callback *callback,
                                                       Nan::Callback *progress,
                                                       LDAP *ld,
                                                       const int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID) {}

void LDAPChangePasswordProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  /* Interval time to the function to verify the message */
  struct timeval timeOut = {constants::ZERO_SECONDS, constants::ONE_USECOND};

  /* Wait until the result is not LDAP_RES_UNSOLICITED*/
  while (result_ == LDAP_RES_UNSOLICITED) {
    result_ =
        ldap_result(ld_, msgID_, constants::ALL_RESULTS, &timeOut, &resultMsg_);
  }
}

void LDAPChangePasswordProgress::HandleOKCallback() {
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

  /* Verify the result */
  switch (result_) {
    /* If the result is constants::LDAP_ERROR then we throw the error */
    case constants::LDAP_ERROR:
    {
      stateClient[0] = Nan::New<v8::Number>(result_);
      callback->Call(1, stateClient);
      break;
    }
    /* If result is LDAP_RES_EXTENDED then we process the operation
     * response */
    case LDAP_RES_EXTENDED:
    {
      const auto status = ldap_result2error(ld_, resultMsg_, false);
      /* We verify if the operation failed or the operation has made
       * succesfully */
      switch (status) {
        case LDAP_SUCCESS:
        {
          stateClient[1] = Nan::New<v8::Number>(LDAP_SUCCESS);
          callback->Call(2, stateClient);
          break;
        }
        default :
        {
          stateClient[0] = Nan::New<v8::Number>(status);
          callback->Call(1, stateClient);
        }
      }
      break;
    }
    /* If the result give other then LDAP_RES_EXTENDED and constants::LDAP_ERROR
     * we throw the constants::LDAP_ERROR */
    default :
    {
      stateClient[0] = Nan::New<v8::Number>(constants::LDAP_ERROR);
      callback->Call(1, stateClient);
    }
  }

  callback->Reset();
  progress_->Reset();
}

void LDAPChangePasswordProgress::HandleProgressCallback(const char *data,
                                                        size_t size) {}
