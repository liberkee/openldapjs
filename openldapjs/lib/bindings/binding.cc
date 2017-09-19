#include <ldap.h>
#include <nan.h>
#include <chrono>
#include <iostream>
#include <map>
#include <string>
#include <thread>
#include "ldap_bind_progress.h"
#include "ldap_compare_progress.h"
#include "ldap_paged_search_progress.h"
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
    Nan::SetPrototypeMethod(tpl, "pagedSearch", pagedSearch);
    Nan::SetPrototypeMethod(tpl, "compare", compare);
    Nan::SetPrototypeMethod(tpl, "unbind", unbind);

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("LDAPClient").ToLocalChecked(),
             Nan::GetFunction(tpl).ToLocalChecked());
  }

 protected:
 private:
  LDAP *ld_;
  std::shared_ptr<std::map<std::string, berval *>> cookies_{};
  explicit LDAPClient() {
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
    int state;
    int protocol_version = LDAP_VERSION3;

    stateClient[0] = Nan::New<v8::Number>(0);
    state = ldap_initialize(&obj->ld_, hostAddress);
    if (state != LDAP_SUCCESS || obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      // Needed to catch a specific error
      return;
    }

    state =
        ldap_set_option(obj->ld_, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if (state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      return;
    }

    stateClient[1] = Nan::New<v8::Number>(1);
    callback->Call(2, stateClient);
    callback->Reset();
    return;
  }

  static NAN_METHOD(startTls) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());

    int state;
    int msgId;

    stateClient[0] = Nan::New<v8::Number>(0);

    state = ldap_start_tls_s(obj->ld_, nullptr, nullptr);
    if (state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(state);
      callback->Call(1, stateClient);
      delete callback;
      return;
    }
    stateClient[1] = Nan::New<v8::Number>(1);
    callback->Call(2, stateClient);
    callback->Reset();
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
    Nan::AsyncQueueWorker(
        new LDAPBindProgress(callback, progress, obj->ld_, msgID));
  }

  static NAN_METHOD(search) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String baseArg(info[0]);
    Nan::Utf8String filterArg(info[2]);

    char *DNbase = *baseArg;
    char *filterSearch = *filterArg;
    int message{};
    int result{};
    struct timeval timeOut = {10, 0};

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    // Verify if the argument is a Number for scope
    if (!info[1]->IsNumber()) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int scopeSearch = info[1]->NumberValue();
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
      stateClient[0] = Nan::New(ldap_err2string(result)).ToLocalChecked();
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
    std::string DNbase = *baseArg;
    std::string filterSearch = *filterArg;
    std::string cookie_id = *cookieID;
    const auto &it = obj->cookies_->find(cookie_id);
    if (it == obj->cookies_->end()) {
      obj->cookies_->insert(it, {cookie_id, nullptr});
    }

    v8::Local<v8::Value> stateClient[4] = {Nan::Null(), Nan::Null(),
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
        callback, progress, obj->ld_, DNbase, scopeSearch, filterSearch,
        cookie_id, pageSize, obj->cookies_));
  }

  static NAN_METHOD(compare) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String DNArg(info[0]);
    Nan::Utf8String attrArg(info[1]);
    Nan::Utf8String valueArg(info[2]);

    char *DNEntry = *DNArg;
    char *attribute = *attrArg;
    char *value = *valueArg;
    int message, result;

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    struct berval bvalue {};

    bvalue.bv_val = value;
    bvalue.bv_len = strlen(value);

    result = ldap_compare_ext(obj->ld_, DNEntry, attribute, &bvalue, nullptr,
                              nullptr, &message);

    Nan::AsyncQueueWorker(
        new LDAPCompareProgress(callback, progress, obj->ld_, message));
  }

  static NAN_METHOD(unbind) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[0].As<v8::Function>());

    if (obj->ld_ == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(2, stateClient);
      delete callback;
      return;
    }

    ldap_unbind(obj->ld_);

    stateClient[1] = Nan::New<v8::Number>(5);
    callback->Call(2, stateClient);
    callback->Reset();

    return;
  }

  static inline Nan::Persistent<v8::Function> &constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }
};

NODE_MODULE(objectwrapper, LDAPClient::Init)
