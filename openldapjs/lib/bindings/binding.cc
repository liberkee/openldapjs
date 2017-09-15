#include <lber.h>
#include <ldap.h>
#include <nan.h>
#include <node.h>
#include <string.h>
#include <chrono>
#include <iostream>
#include <thread>
#include "ldap_bind_progress.h"
#include "ldap_control.h"
#include "ldap_search_progress.h"

using namespace Nan;
using namespace v8;
using namespace std;

class LDAPAddProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;
  LDAPMod **entries;

 public:
  LDAPAddProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                  int msgID, LDAPMod **newEntries)
      : Nan::AsyncProgressWorker(callback),
        progress(progress),
        ld(ld),
        msgID(msgID),
        entries(newEntries) {}
  ~LDAPAddProgress() {}
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
    struct timeval timeOut = {0, 1};

    while (result == 0) {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;
    std::string addResult;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    if (result == -1) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
    } else {
      int status = ldap_result2error(ld, resultMsg, 0);
      if (status != LDAP_SUCCESS) {
        stateClient[0] = Nan::New<v8::Number>(status);
        callback->Call(1, stateClient);
      } else {
        const auto &ldap_controls = new LdapControls();
        addResult = ldap_controls->PrintModificationControls(ld, resultMsg);
        if (addResult != "") {
          stateClient[1] = Nan::New(addResult).ToLocalChecked();
          callback->Call(2, stateClient);

        } else {
          stateClient[1] = Nan::New<v8::Number>(0);
          callback->Call(2, stateClient);
        }
      }
    }
    ldap_msgfree(resultMsg);
    ldap_mods_free(entries, 1);
    callback->Reset();
    progress->Reset();
  }

  void HandleProgressCallback(const char *data, size_t size) {}
};

class LDAPDeleteProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

 public:
  LDAPDeleteProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                     int msgID)
      : Nan::AsyncProgressWorker(callback),
        progress(progress),
        ld(ld),
        msgID(msgID) {}
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
    struct timeval timeOut = {0, 1};
    while (result == 0) {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;
    std::string deleteResult;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    if (result == -1) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
    } else {
      int status = ldap_result2error(ld, resultMsg, 0);
      if (status != LDAP_SUCCESS) {
        stateClient[0] = Nan::New<v8::Number>(status);
        callback->Call(1, stateClient);
      } else {
        const auto &ldap_controls = new LdapControls();
        deleteResult = ldap_controls->PrintModificationControls(ld, resultMsg);
        if (deleteResult != "") {
          stateClient[1] = Nan::New(deleteResult).ToLocalChecked();
          callback->Call(2, stateClient);
        } else {
          stateClient[1] = Nan::New<v8::Number>(0);
          callback->Call(2, stateClient);
        }
      }
    }
    callback->Reset();
    progress->Reset();
    ldap_msgfree(resultMsg);
  }

  void HandleProgressCallback(const char *data, size_t size) {
    // progress.send what ?
  }
};

class LDAPCompareProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

 public:
  LDAPCompareProgress(Nan::Callback *callback, Nan::Callback *progress,
                      LDAP *ld, int msgID)
      : Nan::AsyncProgressWorker(callback),
        progress(progress),
        ld(ld),
        msgID(msgID) {}
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
    struct timeval timeOut = {0, 1};
    while (result == 0) {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
      progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
    }
  }
  // Executes in event loop
  void HandleOKCallback() {
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    if (result == -1) {
      stateClient[1] =
          Nan::New("The Comparison Result: false").ToLocalChecked();
      callback->Call(2, stateClient);
    } else {
      int status = ldap_result2error(ld, resultMsg, 0);
      if (status == LDAP_COMPARE_TRUE || status == LDAP_COMPARE_FALSE) {
        if (status == LDAP_COMPARE_TRUE) {
          stateClient[1] =
              Nan::New("The Comparison Result: true").ToLocalChecked();
        } else {
          stateClient[1] =
              Nan::New("The Comparison Result: false").ToLocalChecked();
        }
        callback->Call(2, stateClient);
      } else {
        // Return ERROR
        stateClient[0] = Nan::New(status);
        callback->Call(1, stateClient);
      }
    }
  }

  void HandleProgressCallback(const char *data, size_t size) {
    // Required, this is not created automatically
    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[] = {Nan::New<v8::Number>(
        *reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv);
  }
};

class LDAPModifyProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;
  LDAPMod **entries;

 public:
  LDAPModifyProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                     int msgID, LDAPMod **newEntries)
      : Nan::AsyncProgressWorker(callback),
        progress(progress),
        ld(ld),
        msgID(msgID),
        entries(newEntries) {}
  ~LDAPModifyProgress() {}

  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
    struct timeval timeOut = {0, 1};
    while (result == 0) {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
    }
  }

  void HandleOKCallback() {
    int status;
    Nan::HandleScope scope;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    std::string modifyResult;

    if (result == -1) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
    } else {
      status = ldap_result2error(ld, resultMsg, 0);
      if (status != LDAP_SUCCESS) {
        stateClient[0] = Nan::New<v8::Number>(status);
        callback->Call(1, stateClient);
      } else {
        const auto &ldap_controls =
            new LdapControls();  // does this  need a delete ?
        modifyResult = ldap_controls->PrintModificationControls(ld, resultMsg);
        if (modifyResult != "") {
          stateClient[1] = Nan::New(modifyResult).ToLocalChecked();
          callback->Call(2, stateClient);
        } else {
          stateClient[1] = Nan::New<v8::Number>(0);
          callback->Call(2, stateClient);
        }
      }
    }
    callback->Reset();
    progress->Reset();
    ldap_mods_free(entries, 1);
    ldap_msgfree(resultMsg);
  }

  void HandleProgressCallback(const char *data, size_t size) {}
};

class LDAPRenameProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

 public:
  LDAPRenameProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld,
                     int msgID)
      : Nan::AsyncProgressWorker(callback),
        progress(progress),
        ld(ld),
        msgID(msgID) {}
  ~LDAPRenameProgress() {}

  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress) {
    struct timeval timeOut = {0, 1};
    while (result == 0) {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
    }
  }

  void HandleOKCallback() {
    int status;
    Nan::HandleScope scope;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    std::string modifyResult;

    if (result == -1) {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
    } else if (result == LDAP_RES_RENAME) {
      status = ldap_result2error(ld, resultMsg, 0);
      if (status != LDAP_SUCCESS) {
        stateClient[0] = Nan::New<v8::Number>(status);
        callback->Call(1, stateClient);
      } else {
        const auto &ldap_controls = new LdapControls();
        modifyResult = ldap_controls->PrintModificationControls(ld, resultMsg);
        if (modifyResult != "") {
          stateClient[1] = Nan::New(modifyResult).ToLocalChecked();
          callback->Call(2, stateClient);
          return;  // return with no cleanup
        }

        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
      callback->Reset();
      progress->Reset();
      ldap_msgfree(resultMsg);
    }
  }

  void HandleProgressCallback(const char *data, size_t size) {}
};

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
    Nan::SetPrototypeMethod(tpl, "newModify", newModify);
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
  LDAP *ld;
  LDAPMessage *result;
  unsigned int stateClient = 0;
  int msgid;
  explicit LDAPClient(){};

  ~LDAPClient(){};

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

    int state = ldap_initialize(&obj->ld, hostAddress);
    if (state != LDAP_SUCCESS || obj->ld == 0) {
      stateClient[0] = Nan::New<v8::Number>(state);
      callback->Call(1, stateClient);
      // Needed for catch a specific error
      delete callback;
      return;
    }

    state =
        ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
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

    int state = ldap_start_tls_s(obj->ld, nullptr, nullptr);
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

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[2].As<Function>());
    Callback *progress = new Callback(info[3].As<v8::Function>());

    char *username = *userArg;
    char *password = *passArg;
    if (obj->ld == nullptr) {
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
    int message, result;
    struct timeval timeOut = {10, 0};

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    // Verify if the argument is a Number for scope
    if (!info[1]->IsNumber()) {  // wouldn't it be better to let it go through
                                 // and just fail with a ldap error in the
                                 // function call ?
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int scopeSearch =
        info[1]->NumberValue();  // why not let it fail with ldap error ?
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
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(
        new LDAPSearchProgress(callback, progress, obj->ld, message));
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

    struct berval bvalue;

    bvalue.bv_val = value;
    bvalue.bv_len = strlen(value);

    result = ldap_compare_ext(obj->ld, DNEntry, attribute, &bvalue, NULL, NULL,
                              &message);

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(2);
      callback->Call(1, stateClient);
      return;
    }
    AsyncQueueWorker(
        new LDAPCompareProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(newModify) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String dn(info[0]);

    v8::Local<v8::Array> mods = v8::Local<v8::Array>::Cast(info[1]);
    v8::Local<v8::Array> controlHandle = v8::Local<v8::Array>::Cast(info[2]);

    unsigned int nummods = mods->Length();

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    LDAPMod **ldapmods = new LDAPMod *[nummods + 1];

    if (obj->ld == 0 || obj->ld == nullptr) {
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
        delete ldapmods;
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
    int msgID, result;

    if (controlHandle == Nan::Null()) {
      result =
          ldap_modify_ext(obj->ld, *dn, ldapmods, nullptr, nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result = ldap_modify_ext(obj->ld, *dn, ldapmods, ctrls.data(), nullptr,
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
    AsyncQueueWorker(
        new LDAPModifyProgress(callback, progress, obj->ld, msgID, ldapmods));
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

    int msgID, result;

    if (controlHandle == Nan::Null()) {
      result = ldap_rename(obj->ld, *dn, *newrdn, *newparent, 1, nullptr,
                           nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result = ldap_rename(obj->ld, *dn, *newrdn, *newparent, 1, ctrls.data(),
                           nullptr, &msgID);
    }

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(
        new LDAPRenameProgress(callback, progress, obj->ld, msgID));
  }

  static NAN_METHOD(modify) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String dn(info[0]);
    v8::Local<v8::Array> entryModify = v8::Local<v8::Array>::Cast(info[2]);
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    if (!info[1]->IsNumber()) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    int operationType = info[1]->NumberValue();
    int length = entryModify->Length();

    if (length < 2 || obj->ld == 0) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    LDAPMod **newEntries = new LDAPMod *[length / 2 + 1];
    for (int i = 0; i < length / 2; i++) {
      Nan::Utf8String type(entryModify->Get(2 * i));
      std::string typeString(*type);
      Nan::Utf8String value(entryModify->Get(2 * i + 1));
      std::string valueString(*value);

      newEntries[i] = new LDAPMod;

      if (typeString.length() > 0 && valueString.length() > 0) {
        newEntries[i]->mod_type = new char[typeString.length() + 1];
        newEntries[i]->mod_values = new char *[2];
        newEntries[i]->mod_values[0] = new char[valueString.length() + 1];

        newEntries[i]->mod_op = operationType;
        memcpy(newEntries[i]->mod_type, typeString.c_str(),
               typeString.length() + 1);
        memcpy(newEntries[i]->mod_values[0], valueString.c_str(),
               valueString.length() + 1);
        newEntries[i]->mod_values[1] = NULL;
      }
    }

    newEntries[length / 2] = NULL;
    char *dns = *dn;
    int msgID = 0;

    if (obj->ld == 0) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int result = ldap_modify_ext(obj->ld, dns, newEntries, NULL, NULL, &msgID);

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(
        new LDAPModifyProgress(callback, progress, obj->ld, msgID, newEntries));
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

    if (obj->ld == 0) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      callback->Reset();
      delete callback;
      progress->Reset();
      delete progress;
      return;
    }

    int result;
    if (controlHandle == Nan::Null()) {
      result = ldap_delete_ext(obj->ld, dns, nullptr, nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result = ldap_delete_ext(obj->ld, dns, ctrls.data(), nullptr, &msgID);
    }

    if (result != 0) {
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(
        new LDAPDeleteProgress(callback, progress, obj->ld, msgID));
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

    if (obj->ld == 0) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int result;

    if (controlHandle == Nan::Null()) {
      result = ldap_add_ext(obj->ld, dns, newEntries, nullptr, nullptr, &msgID);
    } else {
      const auto &ldap_controls = new LdapControls();
      auto ctrls = ldap_controls->CreateModificationControls(controlHandle);
      ctrls.push_back(nullptr);
      result =
          ldap_add_ext(obj->ld, dns, newEntries, ctrls.data(), nullptr, &msgID);
    }

    if (result != 0) {
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete newEntries;
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(
        new LDAPAddProgress(callback, progress, obj->ld, msgID, newEntries));
  }

  static NAN_METHOD(unbind) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());

    if (obj->ld == nullptr) {
      std::cout << "unbind error?:" << std::endl;
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(2, stateClient);
      delete callback;
      return;
    }

    int unbindResult = ldap_unbind(obj->ld);

    if (unbindResult != LDAP_SUCCESS) {
      std::cout << "unbind failed with error code:" << unbindResult
                << std::endl;
    }

    stateClient[1] = Nan::New<v8::Number>(5);
    callback->Call(2, stateClient);

    // freeing callbacks ?
    // callback->Reset();set();
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
