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

using namespace Nan;
using namespace v8;
using namespace std;

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
  LDAP *ld;
  std::shared_ptr<std::map<std::string, berval *>> cookies{};
  LDAPMessage *result;
  unsigned int stateClient = 0;
  int msgid;
  bool initializedFlag = false;
  explicit LDAPClient() {
    cookies = std::make_shared<std::map<std::string, berval *>>();
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
    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[1].As<Function>());
    obj->initializedFlag = true;

    char *hostAddress = *hostArg;
    int state;
    int protocol_version = LDAP_VERSION3;

    stateClient[0] = Nan::New<Number>(0);
    state = ldap_initialize(&obj->ld, hostAddress);
    if (state != LDAP_SUCCESS || obj->ld == 0) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      // Needed for catch a specific error
      return;
    }

    state =
        ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if (state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      return;
    }

    stateClient[1] = Nan::New<Number>(1);
    callback->Call(2, stateClient);
    callback->Reset();
    return;
  }

  static NAN_METHOD(startTls) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[0].As<Function>());

    int state;
    int msgId;

    stateClient[0] = Nan::New<Number>(0);

    state = ldap_start_tls_s(obj->ld, nullptr, nullptr);
    if (state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<Number>(state);
      callback->Call(1, stateClient);
      delete callback;
      return;
    }
    stateClient[1] = Nan::New<Number>(1);
    callback->Call(2, stateClient);
    callback->Reset();
    return;
  }

  static NAN_METHOD(bind) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String userArg(info[0]);
    Nan::Utf8String passArg(info[1]);

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[2].As<Function>());
    Callback *progress = new Callback(info[3].As<v8::Function>());

    char *username = *userArg;
    char *password = *passArg;
    if (obj->ld == 0 || obj->initializedFlag == false) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }
    obj->msgid = ldap_simple_bind(obj->ld, username, password);
    AsyncQueueWorker(
        new LDAPBindProgress(callback, progress, obj->ld, obj->msgid));
  }

  static NAN_METHOD(search) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String baseArg(info[0]);
    Nan::Utf8String filterArg(info[2]);

    char *DNbase = *baseArg;
    char *filterSearch = *filterArg;
    int message;
    int result;
    struct timeval timeOut = {10, 0};

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    // Verify if the argument is a Number for scope
    if (!info[1]->IsNumber()) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int scopeSearch = info[1]->NumberValue();
    if (scopeSearch <= 0 && scopeSearch >= 3) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    if (obj->ld == 0) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    result =
        ldap_search_ext(obj->ld, DNbase, scopeSearch, filterSearch, nullptr, 0,
                        nullptr, nullptr, &timeOut, LDAP_NO_LIMIT, &message);

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New(ldap_err2string(result)).ToLocalChecked();
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(
        new LDAPSearchProgress(callback, progress, obj->ld, message));
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
    const auto &it = obj->cookies->find(cookie_id);
    if (it == obj->cookies->end()) {
      obj->cookies->insert(it, {cookie_id, nullptr});
    }

    Local<Value> stateClient[4] = {Nan::Null(), Nan::Null(), Nan::Null()};

    Callback *callback = new Callback(info[5].As<Function>());
    Callback *progress = new Callback(info[6].As<v8::Function>());

    if (obj->ld == 0) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(new LDAPPagedSearchProgress(
        callback, progress, obj->ld, DNbase, scopeSearch, filterSearch,
        cookie_id, pageSize, obj->cookies));
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

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    struct berval bvalue;

    bvalue.bv_val = value;
    bvalue.bv_len = strlen(value);

    result = ldap_compare_ext(obj->ld, DNEntry, attribute, &bvalue, nullptr,
                              nullptr, &message);

    AsyncQueueWorker(
        new LDAPCompareProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(unbind) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[0].As<Function>());

    if (obj->ld == nullptr || obj->initializedFlag == false) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(2, stateClient);
      delete callback;
      return;
    }

    ldap_unbind(obj->ld);
    obj->initializedFlag = false;

    stateClient[1] = Nan::New<Number>(5);
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
