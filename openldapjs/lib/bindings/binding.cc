#include <lber.h>
#include <ldap.h>
#include <nan.h>
#include <node.h>
#include <string.h>
#include <map>
#include <memory>
#include "constants.h"
#include "ldap_add_progress.h"
#include "ldap_bind_progress.h"
#include "ldap_compare_progress.h"
#include "ldap_control.h"
#include "ldap_delete_progress.h"
#include "ldap_modify_progress.h"
#include "ldap_paged_search_progress.h"
#include "ldap_rename_progress.h"
#include "ldap_search_progress.h"

class LDAPClient : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("LDAPClient").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "initialize", initialize);
    Nan::SetPrototypeMethod(tpl, "startTls", startTls);
    Nan::SetPrototypeMethod(tpl, "bind", bind);
    Nan::SetPrototypeMethod(tpl, "search", search);
    Nan::SetPrototypeMethod(tpl, "modify", modify);
    Nan::SetPrototypeMethod(tpl, "compare", compare);
    Nan::SetPrototypeMethod(tpl, "rename", ldaprename);
    Nan::SetPrototypeMethod(tpl, "unbind", unbind);
    Nan::SetPrototypeMethod(tpl, "delete", del);
    Nan::SetPrototypeMethod(tpl, "add", add);
    Nan::SetPrototypeMethod(tpl, "pagedSearch", pagedSearch);

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("LDAPClient").ToLocalChecked(),
             Nan::GetFunction(tpl).ToLocalChecked());
  }

 protected:
 private:
  LDAP *ld_{};
  std::shared_ptr<std::map<std::string, berval *>> cookies_{};
  LDAPClient() {  //  getting cpp_lint error on this
    cookies_ = std::make_shared<std::map<std::string, berval *>>();
  }

  ~LDAPClient() {}

  static NAN_METHOD(New) {
    if (info.IsConstructCall()) {
      LDAPClient *obj = new LDAPClient();
      obj->Wrap(info.This());
    } else {
      const int argc = 1;
      v8::Local<v8::Value> argv[argc] = {info[0]};
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(cons->NewInstance(argc, argv));
    }
  }

  static NAN_METHOD(initialize) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String hostArg(info[0]);
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[1].As<v8::Function>());

    char *hostAddress = *hostArg;
    int protocol_version = LDAP_VERSION3;

    int state = ldap_initialize(&obj->ld_, hostAddress);
    if (state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(state);
      callback->Call(1, stateClient);
      // Needed to catch a specific error
      delete callback;
      return;
    }

    state =
        ldap_set_option(obj->ld_, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if (state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(state);
      callback->Call(1, stateClient);
      delete callback;
      return;
    }

    stateClient[1] = Nan::True();
    callback->Call(2, stateClient);
    delete callback;
    callback = nullptr;
    return;
  }

  static NAN_METHOD(startTls) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());
    stateClient[0] = Nan::New<v8::Number>(0);

    int state = ldap_start_tls_s(obj->ld_, nullptr, nullptr);
    if (state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(state);
      callback->Call(1, stateClient);
      delete callback;
      callback = nullptr;
      return;
    }

    stateClient[1] = Nan::True();
    callback->Call(2, stateClient);
    delete callback;
    callback = nullptr;
    return;
  }

  static NAN_METHOD(bind) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String userArg(info[0]);
    Nan::Utf8String passArg(info[1]);

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[3].As<v8::Function>());

    char *username = *userArg;
    char *password = *passArg;
    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(constants::INVALID_LD);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }
    int msgID = ldap_simple_bind(obj->ld_, username, password);

    AsyncQueueWorker(new LDAPBindProgress(callback, progress, obj->ld_, msgID));
  }

  static NAN_METHOD(search) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String baseArg(info[0]);
    Nan::Utf8String filterArg(info[2]);

    char *dnBase = *baseArg;
    char *filterSearch = *filterArg;

    struct timeval timeOut = {constants::TEN_SECONDS,
                              constants::ZERO_USECONDS};  // if search exceeds
                                                          // 10 seconds, throws
                                                          // error
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    int scopeSearch = info[1]->NumberValue();

    if (obj->ld_ == nullptr) {
      /* We verify the ld before an operation to see if we should continue or
       * not */
      stateClient[0] = Nan::New<v8::Number>(constants::INVALID_LD);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int message{};
    const auto result =
        ldap_search_ext(obj->ld_, dnBase, scopeSearch, filterSearch, nullptr,
                        constants::ATTR_WANTED, nullptr, nullptr, &timeOut,
                        LDAP_NO_LIMIT, &message);

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    Nan::AsyncQueueWorker(
        new LDAPSearchProgress(callback, progress, obj->ld_, message));
  }

  static NAN_METHOD(pagedSearch) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String baseArg(info[0]);
    int scopeSearch = info[1]->NumberValue();
    Nan::Utf8String filterArg(info[2]);
    int pageSize = info[3]->NumberValue();
    Nan::Utf8String cookieID(info[4]);
    std::string dnBase = *baseArg;
    std::string filterSearch = *filterArg;
    std::string cookie_id = *cookieID;
    const auto &it = obj->cookies_->find(cookie_id);
    if (it == obj->cookies_->end()) {
      obj->cookies_->insert(it, {cookie_id, nullptr});
    }

    v8::Local<v8::Value> stateClient[3] = {Nan::Null(), Nan::Null(),
                                           Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[5].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[6].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    Nan::AsyncQueueWorker(new LDAPPagedSearchProgress(
        callback, progress, obj->ld_, dnBase, scopeSearch, filterSearch,
        cookie_id, pageSize, obj->cookies_));
  }

  static NAN_METHOD(compare) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Utf8String DNArg(info[0]);
    Nan::Utf8String attrArg(info[1]);
    Nan::Utf8String valueArg(info[2]);

    char *DNEntry = *DNArg;
    char *attribute = *attrArg;
    char *value = *valueArg;
    int message, result;

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    struct berval bvalue {};

    bvalue.bv_val = value;
    bvalue.bv_len = strlen(value);

    result = ldap_compare_ext(obj->ld_, DNEntry, attribute, &bvalue, NULL, NULL,
                              &message);

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }
    Nan::AsyncQueueWorker(
        new LDAPCompareProgress(callback, progress, obj->ld_, message));
  }

  static NAN_METHOD(modify) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String dn(info[0]);

    v8::Local<v8::Array> mods = v8::Local<v8::Array>::Cast(info[1]);
    v8::Local<v8::Array> controlHandle = v8::Local<v8::Array>::Cast(info[2]);

    unsigned int nummods = mods->Length();

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    LDAPMod **ldapmods = new LDAPMod *[nummods + 1];

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(constants::INVALID_LD);
      callback->Call(1, stateClient);
      delete ldapmods;
      delete callback;
      delete progress;
      return;
    }

    for (unsigned int i = 0; i < nummods; i++) {
      v8::Local<v8::Object> modHandle =
          v8::Local<v8::Object>::Cast(mods->Get(Nan::New(i)));
      ldapmods[i] = new LDAPMod;
      v8::String::Utf8Value mod_op(
          modHandle->Get(Nan::New("op").ToLocalChecked()));

      if (std::strcmp(*mod_op, "add") ==
          constants::STRING_EQUAL) {  // can't we just use !std::strcmp(..,..)?
        ldapmods[i]->mod_op = LDAP_MOD_ADD;
      } else if (std::strcmp(*mod_op, "delete") == constants::STRING_EQUAL) {
        ldapmods[i]->mod_op = LDAP_MOD_DELETE;
      } else if (std::strcmp(*mod_op, "replace") == constants::STRING_EQUAL) {
        ldapmods[i]->mod_op = LDAP_MOD_REPLACE;
      } else {
        stateClient[0] = Nan::New<v8::Number>(LDAP_INVALID_SYNTAX);
        callback->Call(1, stateClient);
        delete[] ldapmods;
        delete callback;
        delete progress;
        return;
      }

      v8::String::Utf8Value mod_type(
          modHandle->Get(Nan::New("attr").ToLocalChecked()));
      ldapmods[i]->mod_type = strdup(*mod_type);

      v8::Local<v8::Array> modValsHandle = v8::Local<v8::Array>::Cast(
          modHandle->Get(Nan::New("vals").ToLocalChecked()));

      int modValsLength = modValsHandle->Length();
      ldapmods[i]->mod_values = new char *[modValsLength + 1];
      for (int j = 0; j < modValsLength; j++) {
        Nan::Utf8String modValue(modValsHandle->Get(Nan::New(j)));
        ldapmods[i]->mod_values[j] = strdup(*modValue);
      }
      ldapmods[i]->mod_values[modValsLength] = nullptr;
    }

    ldapmods[nummods] = nullptr;
    int msgID{};
    int result{};

    if (controlHandle == Nan::Null()) {
      result =
          ldap_modify_ext(obj->ld_, *dn, ldapmods, nullptr, nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result = ldap_modify_ext(obj->ld_, *dn, ldapmods, ctrls.data(), nullptr,
                               &msgID);
    }

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
      delete[] ldapmods;
      delete callback;
      delete progress;
      return;
    }

    ldap_mods_free(ldapmods, true);
    Nan::AsyncQueueWorker(
        new LDAPModifyProgress(callback, progress, obj->ld_, msgID));
  }

  static NAN_METHOD(ldaprename) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String dn(info[0]);
    Nan::Utf8String newrdn(info[1]);
    Nan::Utf8String newparent(info[2]);
    v8::Local<v8::Array> controlHandle = v8::Local<v8::Array>::Cast(info[3]);

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[4].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[5].As<v8::Function>());

    int msgID{};
    int result{};

    if (controlHandle == Nan::Null()) {
      result = ldap_rename(obj->ld_, *dn, *newrdn, *newparent, 1, nullptr,
                           nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result = ldap_rename(obj->ld_, *dn, *newrdn, *newparent, 1, ctrls.data(),
                           nullptr, &msgID);
    }

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    Nan::AsyncQueueWorker(
        new LDAPRenameProgress(callback, progress, obj->ld_, msgID));
  }

  static NAN_METHOD(del) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Utf8String dn(info[0]);
    v8::Local<v8::Array> controlHandle = v8::Local<v8::Array>::Cast(info[1]);

    char *dns = *dn;

    int msgID{};

    Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[3].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(constants::INVALID_LD);
      callback->Call(1, stateClient);
      callback->Reset();
      delete callback;
      progress->Reset();
      delete progress;
      return;
    }

    int result{};
    if (controlHandle == Nan::Null()) {
      result = ldap_delete_ext(obj->ld_, dns, nullptr, nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result = ldap_delete_ext(obj->ld_, dns, ctrls.data(), nullptr, &msgID);
    }

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    Nan::AsyncQueueWorker(
        new LDAPDeleteProgress(callback, progress, obj->ld_, msgID));
  }

  static NAN_METHOD(add) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String dn(info[0]);
    v8::Local<v8::Array> entries = v8::Local<v8::Array>::Cast(info[1]);
    v8::Local<v8::Array> controlHandle = v8::Local<v8::Array>::Cast(info[2]);
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    unsigned int nummods = entries->Length();

    LDAPMod **newEntries = new LDAPMod *[nummods + 1];

    for (unsigned int i = 0; i < nummods; i++) {
      v8::Local<v8::Object> modHandle =
          v8::Local<v8::Object>::Cast(entries->Get(Nan::New(i)));
      newEntries[i] = new LDAPMod;
      newEntries[i]->mod_op = LDAP_MOD_ADD;

      v8::String::Utf8Value mod_type(
          modHandle->Get(Nan::New("attr").ToLocalChecked()));
      newEntries[i]->mod_type = strdup(*mod_type);
      v8::Local<v8::Array> modValsHandle = v8::Local<v8::Array>::Cast(
          modHandle->Get(Nan::New("vals").ToLocalChecked()));
      int modValsLength = modValsHandle->Length();
      newEntries[i]->mod_values = new char *[modValsLength + 1];
      for (int j = 0; j < modValsLength; j++) {
        Nan::Utf8String modValue(modValsHandle->Get(Nan::New(j)));
        newEntries[i]->mod_values[j] = strdup(*modValue);
      }
      newEntries[i]->mod_values[modValsLength] = nullptr;
    }
    newEntries[nummods] = nullptr;

    char *dns = *dn;
    int msgID{};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(constants::INVALID_LD);
      callback->Call(1, stateClient);
      delete[] newEntries;
      delete callback;
      delete progress;
      return;
    }

    int result{};

    if (controlHandle == Nan::Null()) {
      result =
          ldap_add_ext(obj->ld_, dns, newEntries, nullptr, nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result = ldap_add_ext(obj->ld_, dns, newEntries, ctrls.data(), nullptr,
                            &msgID);  // async op
    }

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
      delete[] newEntries;
      delete callback;
      delete progress;
      return;
    }

    ldap_mods_free(newEntries,
                   true);  // free before it finishes ? isn't this dangerous ?

    Nan::AsyncQueueWorker(
        new LDAPAddProgress(callback, progress, obj->ld_, msgID));
  }

  static NAN_METHOD(unbind) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(constants::INVALID_LD);
      callback->Call(1, stateClient);
      delete callback;
      delete callback;
      return;
    }

    int unbindResult = ldap_unbind(obj->ld_);

    if (unbindResult != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(unbindResult);
      callback->Call(1, stateClient);
      delete callback;
      return;
    }

    stateClient[1] = Nan::True();
    callback->Call(2, stateClient);
    callback->Reset();

    delete callback;
    callback = nullptr;

    return;
  }

  static inline Nan::Persistent<v8::Function> &constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }
};

NODE_MODULE(objectwrapper, LDAPClient::Init)
