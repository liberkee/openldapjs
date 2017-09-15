#include "ldap_search_progress.h"

LDAPSearchProgress::LDAPSearchProgress(Callback *callback, Callback *progress,
                                       LDAP *ld, int msgID)
    : AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID) {}

void LDAPSearchProgress::Execute(
    const AsyncProgressWorker::ExecutionProgress &progress) {
  struct timeval timeOut = {1, 0};

  BerElement *ber;
  LDAPMessage *l_result;
  LDAPMessage *l_entry;
  char *attribute;
  char **values;
  char *l_dn;
  int result = 0;

  while (result == 0) {
    result = ldap_result(ld, msgID, 1, &timeOut, &l_result);
  }

  for (l_entry = ldap_first_entry(ld, l_result); l_entry != nullptr;
       l_entry = ldap_next_entry(ld, l_entry)) {
    l_dn = ldap_get_dn(ld, l_entry);
    resultSearch += "\n";
    resultSearch += "dn:";
    resultSearch += l_dn;
    resultSearch += "\n";
    ldap_memfree(l_dn);

    for (attribute = ldap_first_attribute(ld, l_entry, &ber);
         attribute != nullptr;
         attribute = ldap_next_attribute(ld, l_entry, ber)) {
      if ((values = ldap_get_values(ld, l_entry, attribute)) != nullptr) {
        for (int i = 0; values[i] != nullptr; i++) {
          resultSearch += attribute;
          resultSearch += ":";
          resultSearch += values[i];
          resultSearch += "\n";
        }
        ldap_value_free(values);
      }
      ldap_memfree(attribute);
    }
    ber_free(ber, 0);
    resultSearch += "\n";
  }

  status = ldap_result2error(ld, l_result, 0);

  /* Free the search results.                                       */
  ldap_msgfree(l_result);
}

// Executes in event loop
void LDAPSearchProgress::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
  if (status != LDAP_SUCCESS) {
    stateClient[0] = Nan::New(status);
    callback->Call(1, stateClient);
  } else {
    stateClient[1] = Nan::New(resultSearch).ToLocalChecked();
    callback->Call(2, stateClient);
  }

  callback->Reset();
  progress->Reset();
}

void LDAPSearchProgress::HandleProgressCallback(const char *data, size_t size) {
  // Required, this is not created automatically
}
