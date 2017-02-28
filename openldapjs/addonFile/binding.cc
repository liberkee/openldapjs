#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string>
#include <thread>
#include <chrono>

using namespace Nan;
using namespace v8;
using namespace std;

class LDAPBindProgress : public AsyncProgressWorker {
    private:
      LDAP *ld;
      Callback *progress;
      int result = 0;
      LDAPMessage *resultMsg;
      int msgID;
    public:
      LDAPBindProgress(Callback * callback, Callback * progress, LDAP *ld, int msgID) 
          : AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID) {    
      }
    // Executes in worker thread
    void Execute(const AsyncProgressWorker::ExecutionProgress& progress) {
      struct timeval timeOut = {0, 10000};
      while(result == 0) {
        result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
        progress.Send(reinterpret_cast<const char*>(&result), sizeof(int));
        // Set 1 milliseconds for catch the second callback
         std::this_thread::sleep_for(chrono::milliseconds(1));
      }
    }
    // Executes in event loop
    void HandleOKCallback () {
      Local<Value> stateClient[2] = {Null(), Null()};
      if (result == -1) {
        stateClient[0] = Nan::New<Number>(0);
        callback->Call(1, stateClient);
      }
      else {
        int status = ldap_result2error(ld, resultMsg, 0);
        if(status != LDAP_SUCCESS) {
          stateClient[0] = Nan::New<Number>(status);
          callback->Call(1, stateClient);
        }
        stateClient[1] = Nan::New<Number>(2);
        callback->Call(2, stateClient);
      }
    }
    
    void HandleProgressCallback(const char *data, size_t size) {
        // Required, this is not created automatically 
        Nan::HandleScope scope; 
        Local<Value> argv[] = {
            New<v8::Number>(*reinterpret_cast<int*>(const_cast<char*>(data)))
        };
        progress->Call(1, argv);
    }
};

class LDAPClient : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("LDAPClient").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "initialize", initialize);
    Nan::SetPrototypeMethod(tpl, "bind", bind);
    Nan::SetPrototypeMethod(tpl, "unbind", unbind);

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
  bool initializedFlag = false;
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
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String hostArg(info[0]);
    Local<Value> stateClient[2] = {Null(), Null()};
    Callback *callback = new Callback(info[1].As<Function>());
    obj->initializedFlag = true;

    char *hostAddress = *hostArg;
    int state;
    int protocol_version = LDAP_VERSION3;
    state = ldap_initialize(&obj->ld, hostAddress);
    if(state != LDAP_SUCCESS || obj->ld == 0) {

      stateClient[0] = Nan::New<Number>(0);
      callback->Call(2, stateClient);
      // Needed for catch a specific error
      obj->initializedFlag = false;
      return;
    }

    state = ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if(state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(2, stateClient);
      obj->initializedFlag = false;
      return;
    }

    stateClient[1] = Nan::New<Number>(1);
    callback->Call(2, stateClient);
    return;
  }

  static NAN_METHOD(bind) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String userArg(info[0]);
    Nan::Utf8String passArg(info[1]);

    char *username = *userArg;
    char *password = *passArg;
    if(obj->ld == 0 || obj->initializedFlag == false) {
      obj->stateClient = 0;
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }
    obj->msgid = ldap_simple_bind(obj->ld, username, password);

    Callback *callback = new Callback(info[2].As<Function>());
    Callback *progress = new Callback(info[3].As<v8::Function>());

    AsyncQueueWorker(new LDAPBindProgress(callback, progress, obj->ld, obj->msgid));
  }

  static NAN_METHOD(unbind) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Local<Value> stateClient[2] = {Null(), Null()};
    Callback *callback = new Callback(info[0].As<Function>());

    if (obj->ld == NULL || obj->initializedFlag == false) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(2, stateClient);
      return;
    }

    ldap_unbind(obj->ld);
    obj->initializedFlag = false;

    stateClient[1] = Nan::New<Number>(5);
    callback->Call(2, stateClient);

    return;
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};

NODE_MODULE(objectwrapper, LDAPClient::Init)
