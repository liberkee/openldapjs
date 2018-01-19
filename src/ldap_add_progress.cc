#include "ldap_add_progress.h"
#include <string>
#include "constants.h"
#include "ldap_control.h"

LDAPAddProgress::LDAPAddProgress(Nan::Callback *callback,
                                 Nan::Callback *progress,
                                 const std::shared_ptr<LDAP> &ld,
                                 const int msgID, struct timeval timeOut)
    : Nan::AsyncProgressWorker(callback),
      ld_(ld),
      progress_(progress),
      msgID_(msgID),
      timeOut_(timeOut) {}

LDAPAddProgress::~LDAPAddProgress() {}

void LDAPAddProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  result_ = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut_,
                        &resultMsg_);
}

void LDAPAddProgress::HandleOKCallback() {
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
    case LDAP_RES_ADD: {
      const auto status = ldap_result2error(ld_.get(), resultMsg_, false);
      switch (status) {
        case LDAP_SUCCESS: {
          const auto &ldap_controls = new LdapControls();
          std::string addResult =
              ldap_controls->PrintModificationControls(ld_.get(), resultMsg_);
          if (!addResult.empty()) {
            stateClient[1] = Nan::New(addResult).ToLocalChecked();
            callback->Call(2, stateClient);

          } else {
            stateClient[1] = Nan::New<v8::Number>(LDAP_SUCCESS);
            callback->Call(2, stateClient);
          }
          delete ldap_controls;
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
  callback->Reset();
  progress_->Reset();
  ldap_msgfree(resultMsg_);
}

void LDAPAddProgress::HandleProgressCallback(const char *data, size_t size) {}
