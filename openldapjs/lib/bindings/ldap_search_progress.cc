#include "ldap_search_progress.h"
#include "constants.h"

LDAPSearchProgress::LDAPSearchProgress(Nan::Callback *callback,
                                       Nan::Callback *progress,
                                       std::shared_ptr<LDAP> ld,
                                       const int msgID)
    : Nan::AsyncProgressWorker(callback),
      progress_(progress),
      ld_(ld),
      msgID_(msgID) {}

LDAPSearchProgress::~LDAPSearchProgress() {}

void LDAPSearchProgress::Execute(
    const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {constants::ONE_SECOND, constants::ZERO_USECONDS};

  BerElement *ber{};
  LDAPMessage *l_result{};
  LDAPMessage *l_entry{};
  char *attribute{};
  char **values{};
  char *l_dn{};
  int result{};

  while (result == constants::LDAP_NOT_FINISHED) {
    result = ldap_result(ld_.get(), msgID_, constants::ALL_RESULTS, &timeOut,
                         &l_result);
  }

  for (l_entry = ldap_first_entry(ld_.get(), l_result); l_entry != nullptr;
       l_entry = ldap_next_entry(ld_.get(), l_entry)) {
    l_dn = ldap_get_dn(ld_.get(), l_entry);
    resultSearch_ += constants::newLine;
    resultSearch_ += constants::dn;
    resultSearch_ += constants::separator;
    resultSearch_ += l_dn;
    resultSearch_ += constants::newLine;
    ldap_memfree(l_dn);

    for (attribute = ldap_first_attribute(ld_.get(), l_entry, &ber);
         attribute != nullptr;
         attribute = ldap_next_attribute(ld_.get(), l_entry, ber)) {
      if ((values = ldap_get_values(ld_.get(), l_entry, attribute)) != nullptr) {
        for (int i = 0; values[i] != nullptr; i++) {
          resultSearch_ += attribute;
          resultSearch_ += constants::separator;
          resultSearch_ += values[i];
          resultSearch_ += constants::newLine;
        }
        ldap_value_free(values);
      }
      ldap_memfree(attribute);
    }
    ber_free(ber, false);
    resultSearch_ += constants::newLine;
  }

  status_ = ldap_result2error(ld_.get(), l_result, false);

  /* Free the search results.                                       */
  ldap_msgfree(l_result);
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
