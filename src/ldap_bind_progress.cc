#include "ldap_bind_progress.h"
#include "constants.h"

LDAPBindProgress::LDAPBindProgress(Nan::Callback *callback,
                                   Nan::Callback *progress, LDAP *ld,
                                   const int msgID, struct timeval timeOut)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID),
      timeOut_(timeOut) {}

/**
** Execute Method, runs outside the event loop.
**/
void LDAPBindProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  result_ =
      ldap_result(ld_, msgID_, constants::ALL_RESULTS, &timeOut_, &resultMsg_);
}

/**
** HandleOkCallback method, gets called when the execute method finishes.
**/
void LDAPBindProgress::HandleOKCallback() {
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
    case LDAP_RES_BIND: {
      const auto status = ldap_result2error(ld_, resultMsg_, false);

      switch (status) {
        case LDAP_SUCCESS: {
          stateClient[1] = Nan::New<v8::Number>(status);
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
    default: {
      stateClient[0] = Nan::New<v8::Number>(constants::LDAP_ERROR);
      callback->Call(1, stateClient);
    }
  }

  ldap_msgfree(resultMsg_);
  callback->Reset();
  progress_->Reset();
}

void LDAPBindProgress::HandleProgressCallback(const char *data, size_t size) {}
