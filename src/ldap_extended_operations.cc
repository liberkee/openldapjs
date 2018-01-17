#include "ldap_extended_operations.h"
LdapExtendedOperations::LdapExtendedOperations() :
  functionMap_ {
{LDAP_EXOP_CANCEL, std::bind(&LdapExtendedOperations::LdapExopCancel, this, std::placeholders::_1)},
    }
{}


struct berval* LdapExtendedOperations::LdapExopCancel(const v8::Local<v8::Object> &objectData) {
  v8::String::Utf8Value requestData(objectData->Get(Nan::New("first").ToLocalChecked()));
  BerElement *cancelidber = nullptr;
  struct berval cancelId{};
  int valueOfString = std::stoi(*requestData);
  cancelidber = ber_alloc_t(LBER_USE_DER);
  ber_printf(cancelidber, "{i}", valueOfString);
  ber_flatten2(cancelidber, &cancelId, 0);
  return &cancelId;
}

std::map<std::string, std::function<struct berval* (const v8::Local<v8::Object> &)>> LdapExtendedOperations::functionMap() const {
  return functionMap_;
}

