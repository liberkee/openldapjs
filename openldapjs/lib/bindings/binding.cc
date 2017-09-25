#include <lber.h>
#include <ldap.h>
#include <nan.h>
#include <node.h>
#include <string.h>
#include <chrono>
#include <iostream>
#include "constants.h"
#include "ldap_add_progress.h"
#include "ldap_bind_progress.h"
#include "ldap_compare_progress.h"
#include "ldap_control.h"
#include "ldap_delete_progress.h"
#include "ldap_modify_progress.h"
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
    Nan::SetPrototypeMethod(tpl, "del", del);
    Nan::SetPrototypeMethod(tpl, "add", add);

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("LDAPClient").ToLocalChecked(),
             Nan::GetFunction(tpl).ToLocalChecked());
  }

 protected:
 private:
  LDAP *ld_{};
  explicit LDAPClient() {}

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

    stateClient[1] = Nan::New<v8::Number>(1);
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

    stateClient[1] = Nan::New<v8::Number>(1);  // why the 1 ?:)
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
      stateClient[0] = Nan::New<v8::Number>(0);
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

    char *DNbase = *baseArg;
    char *filterSearch = *filterArg;
    int message{};
    int result{};
    struct timeval timeOut = {constants::TEN_SECONDS,
                              constants::ZERO_USECONDS};  // if search exceeds
                                                          // 10 seconds, throws
                                                          // error

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    // Verify if the argument is a Number for scope
    if (!info[1]->IsNumber()) {  // wouldn't it be better to let it go through
                                 // and just fail with a ldap error in the
                                 // function call ?
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int scopeSearch =
        info[1]->NumberValue();  // why not let it fail with ldap error ?
    if (scopeSearch <= 0 && scopeSearch >= 3) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    result =
        ldap_search_ext(obj->ld_, DNbase, scopeSearch, filterSearch, nullptr, 0,
                        nullptr, nullptr, &timeOut, LDAP_NO_LIMIT, &message);

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
      stateClient[0] = Nan::New<v8::Number>(2);
      callback->Call(1, stateClient);
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
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
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

      if (std::strcmp(*mod_op, "add") == 0) {
        ldapmods[i]->mod_op = LDAP_MOD_ADD;
      } else if (std::strcmp(*mod_op, "delete") == 0) {
        ldapmods[i]->mod_op = LDAP_MOD_DELETE;
      } else if (std::strcmp(*mod_op, "replace") == 0) {
        ldapmods[i]->mod_op = LDAP_MOD_REPLACE;
      } else {
        stateClient[0] = Nan::New<v8::Number>(LDAP_INVALID_SYNTAX);
        callback->Call(1, stateClient);
        delete ldapmods;  // shouldn't it be delete[] ? or better yet use
                          // ldap_modsfree?
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
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete ldapmods;
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
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
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

    int msgID = 0;

    Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[3].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(0);
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

    if (result != 0) {
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    Nan::AsyncQueueWorker(
        new LDAPDeleteProgress(callback, progress, obj->ld_, msgID));
  }

  /**
** Method that calls the ldap_add_ext routine.
** The entries are taken from a string array 2 by 2 in a for loop
*(LDAPMods.mod_type and LDAPMods.mod_values respectively)
** entries are placed in the LDAPMod *newEntries[] array alocating memory in
*each iteration.
** Note: both the last value in mod_values array and in the newEntries array
*has to be NULL
**/

  static NAN_METHOD(add) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String dn(info[0]);
    v8::Local<v8::Array> entries = v8::Local<v8::Array>::Cast(info[1]);
    v8::Local<v8::Array> controlHandle = v8::Local<v8::Array>::Cast(info[2]);
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    int length = entries->Length();
    if (length < 2) {
      return;
    }

    LDAPMod **newEntries = new LDAPMod *[length / 2 + 1];
    for (int i = 0; i < length / 2; i++) {
      Nan::Utf8String type(entries->Get(2 * i));
      std::string typeString(*type);
      Nan::Utf8String value(entries->Get(2 * i + 1));
      std::string valueString(*value);

      newEntries[i] = new LDAPMod;

      if (typeString.length() > 0 && valueString.length() > 0) {
        newEntries[i]->mod_type = new char[typeString.length() + 1];
        newEntries[i]->mod_values = new char *[2];
        newEntries[i]->mod_values[0] = new char[valueString.length() + 1];

        newEntries[i]->mod_op = LDAP_MOD_ADD;
        memcpy(newEntries[i]->mod_type, typeString.c_str(),
               typeString.length() + 1);
        memcpy(newEntries[i]->mod_values[0], valueString.c_str(),
               valueString.length() + 1);
        newEntries[i]->mod_values[1] = nullptr;
      }
    }

    newEntries[length / 2] = nullptr;

    char *dns = *dn;
    int msgID = 0;

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
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
                            &msgID);
    }

    if (result != 0) {
      stateClient[0] =
          Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);  // why insuficient
                                                           // access instead of
                                                           // result ?
      callback->Call(1, stateClient);
      delete newEntries;
      delete callback;
      delete progress;
      return;
    }

    ldap_mods_free(newEntries, true);

    Nan::AsyncQueueWorker(
        new LDAPAddProgress(callback, progress, obj->ld_, msgID));
  }

  static NAN_METHOD(unbind) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(2, stateClient);
      delete callback;
      return;
    }

    int unbindResult = ldap_unbind(obj->ld_);

    if (unbindResult != LDAP_SUCCESS) {
      // nothing done in case unbind fails ?
    }

    stateClient[1] = Nan::New<v8::Number>(5);
    callback->Call(2, stateClient);

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
