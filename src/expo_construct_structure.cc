#include "expo_construct_structure.h"

ExpoConstructStructure::ExpoConstructStructure()
    : functionMap_{
          {LDAP_EXOP_CANCEL, std::bind(&ExpoConstructStructure::LdapExopCancel,
                                       this, std::placeholders::_1)},
          {LDAP_EXOP_MODIFY_PASSWD,
           std::bind(&ExpoConstructStructure::LdapExopChangePassword, this,
                     std::placeholders::_1)},
          {LDAP_EXOP_REFRESH,
           std::bind(&ExpoConstructStructure::LdapExopRefresh, this,
                     std::placeholders::_1)},
      } {
  valueConstr_ = ber_alloc_t(LBER_USE_DER);
}

struct berval ExpoConstructStructure::LdapExopCancel(
    const v8::Local<v8::Object> &objectData) {
        
  v8::String::Utf8Value idOperation(
      objectData->Get(Nan::New("0").ToLocalChecked()));

  int id = std::stoi(*idOperation);
  ber_printf(valueConstr_, "{i}", id);

  ber_flatten2(valueConstr_, &valueBer_, 0);
  
  return valueBer_;
}

struct berval ExpoConstructStructure::LdapExopChangePassword(
    const v8::Local<v8::Object> &objectData) {

  v8::String::Utf8Value userDN(
      objectData->Get(Nan::New("0").ToLocalChecked()));
  v8::String::Utf8Value oldPassword(
      objectData->Get(Nan::New("1").ToLocalChecked()));
  v8::String::Utf8Value newPassword(
      objectData->Get(Nan::New("2").ToLocalChecked()));

  static struct berval user = {0, NULL};
  static struct berval newpw = {0, NULL};
  static struct berval oldpw = {0, NULL};

  user.bv_val = strdup(*userDN);
  user.bv_len = strlen(user.bv_val);

  newpw.bv_val = strdup(*newPassword);
  newpw.bv_len = strlen(newpw.bv_val);

  oldpw.bv_val = strdup(*oldPassword);
  oldpw.bv_len = strlen(oldpw.bv_val);

  ber_printf(valueConstr_, "{" /*}*/);
  ber_printf(valueConstr_, "tO", LDAP_TAG_EXOP_MODIFY_PASSWD_ID, user);
  ber_printf(valueConstr_, "tO", LDAP_TAG_EXOP_MODIFY_PASSWD_OLD, oldpw);
  ber_printf(valueConstr_, "tO", LDAP_TAG_EXOP_MODIFY_PASSWD_NEW, newpw);
  ber_printf(valueConstr_, /*{*/ "N}");

  ber_flatten2(valueConstr_, &valueBer_, 0);

  return valueBer_;
}
struct berval ExpoConstructStructure::LdapExopRefresh(
    const v8::Local<v8::Object> &objectData) {

  v8::String::Utf8Value userDN(
      objectData->Get(Nan::New("0").ToLocalChecked()));

  static struct berval user = {0, NULL};

  user.bv_val = strdup(*userDN);
  user.bv_len = strlen(user.bv_val);

  ber_printf(valueConstr_, "{tOtiN}", LDAP_TAG_EXOP_REFRESH_REQ_DN, user,
             LDAP_TAG_EXOP_REFRESH_REQ_TTL, nullptr);

  ber_flatten2(valueConstr_, &valueBer_, 0);

  return valueBer_;
}

std::map<std::string, std::function<struct berval(const v8::Local<v8::Object> &)>>
    ExpoConstructStructure::functionMap() const {
  return functionMap_;
}