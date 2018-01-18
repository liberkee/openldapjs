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
      } {}

struct berval ExpoConstructStructure::LdapExopCancel(
    const v8::Local<v8::Object> &objectData) {
  v8::String::Utf8Value requestData(
      objectData->Get(Nan::New("first").ToLocalChecked()));
  BerElement *cancelidber = nullptr;
  struct berval cancelId {};
  int valueOfString = std::stoi(*requestData);
  cancelidber = ber_alloc_t(LBER_USE_DER);
  ber_printf(cancelidber, "{i}", valueOfString);
  ber_flatten2(cancelidber, &cancelId, 0);
  return cancelId;
}

struct berval ExpoConstructStructure::LdapExopChangePassword(
    const v8::Local<v8::Object> &objectData) {
  v8::String::Utf8Value userDN(
      objectData->Get(Nan::New("userDN").ToLocalChecked()));
  v8::String::Utf8Value oldPassword(
      objectData->Get(Nan::New("oldPass").ToLocalChecked()));
  v8::String::Utf8Value newPassword(
      objectData->Get(Nan::New("newPass").ToLocalChecked()));
  static struct berval user = {0, NULL};
  static struct berval newpw = {0, NULL};
  static struct berval oldpw = {0, NULL};
  BerElement *changePass = nullptr;
  struct berval changePassRes {};

  /* The message ID that the ldap_passwd will have */

  /* Set the pointer data into a berval structure */
  user.bv_val = strdup(*userDN);
  user.bv_len = strlen(user.bv_val);

  newpw.bv_val = strdup(*newPassword);
  newpw.bv_len = strlen(newpw.bv_val);

  oldpw.bv_val = strdup(*oldPassword);
  oldpw.bv_len = strlen(oldpw.bv_val);
  changePass = ber_alloc_t(LBER_USE_DER);

  ber_printf(changePass, "{" /*}*/);
  ber_printf(changePass, "tO", LDAP_TAG_EXOP_MODIFY_PASSWD_ID, user);
  ber_printf(changePass, "tO", LDAP_TAG_EXOP_MODIFY_PASSWD_OLD, oldpw);
  ber_printf(changePass, "tO", LDAP_TAG_EXOP_MODIFY_PASSWD_NEW, newpw);
  ber_printf(changePass, /*{*/ "N}");
  ber_flatten2(changePass, &changePassRes, 0);
  return changePassRes;
}
struct berval ExpoConstructStructure::LdapExopRefresh(
    const v8::Local<v8::Object> &objectData) {
  v8::String::Utf8Value userDN(
      objectData->Get(Nan::New("userDN").ToLocalChecked()));
  BerElement *ldapRefresh{};
  struct berval refresh {};
  static struct berval user = {0, NULL};
  user.bv_val = strdup(*userDN);
  user.bv_len = strlen(user.bv_val);
  ldapRefresh = ber_alloc_t(LBER_USE_DER);
  ber_printf(ldapRefresh, "{tOtiN}", LDAP_TAG_EXOP_REFRESH_REQ_DN, user,
             LDAP_TAG_EXOP_REFRESH_REQ_TTL, nullptr);
  ber_flatten2(ldapRefresh, &refresh, 0);
  return refresh;
}

std::map<std::string,
         std::function<struct berval(const v8::Local<v8::Object> &)>>
ExpoConstructStructure::functionMap() const {
  return functionMap_;
}