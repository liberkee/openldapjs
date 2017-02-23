#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string>
#include <thread>
#include <chrono>

using namespace Nan;
using namespace v8;
using namespace std;


/*class LDAPInitialization : public AsyncWorker {
  public:
    LDAPInitialization(Callback * callback, std::string hostArg, LDAP *clientLD)
    : AsyncWorker(callback), hostArg(hostArg), ld(clientLD), result(0){
    }

    void Execute() {
      const char *host = hostArg.c_str();
      result = ldap_initialize(&ld, host);
    }

    void HandleOKCallback() {
      Local<Value> stateClient[2] = {Null(), Null()};
      int protocol_version = LDAP_VERSION3;
      if (result != LDAP_SUCCESS) {
        stateClient[0] = Nan::New("The host is incorect").ToLocalChecked();
        callback->Call(1, stateClient);
      }
      else {
        result = ldap_set_option(ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
        if(result != LDAP_SUCCESS) {
          stateClient[0] = Nan::New("Option incorect").ToLocalChecked();
          callback->Call(1, stateClient);
        }
        stateClient[1] = Nan::New("Initialization").ToLocalChecked();
        callback->Call(2, stateClient);
      }
    }
  private:
    std::string hostArg;
    int result;
    LDAP *ld;
    
};*/

/*class LDAPBind : public AsyncWorker {
  public:
    LDAPBind(Callback * callback)
    : AsyncWorker(callback) {}

    void Execute() {
      struct timeval timeOut;
      timeOut.tv_sec = timeOut.tv_usec = 0L;
      result = ldap_result(ld, msgID, NULL, &timeOut, &resultMsg);
    }

    void HandleOKCallback() {
      Local<Value> stateClient[2] = {Null(), Null()};
      if (result == -1) {
        stateClient[0] = Nan::New("ERROR: Result").ToLocalChecked();
        callback->Call(1, stateClient);
      }
      if (result == 0) {
        stateClient[1] = Nan::New("On Progress").ToLocalChecked();
        callback->Call(2, stateClient);
      }
      if (result != 0 && result != -1) {
        int status = ldap_result2error(ld, resultMsg, 0);
        if (status != LDAP_SUCCESS) {
            stateClient[0] = Nan::New<Number>(status);
            callback->Call(1, stateClient);
          }
          stateClient[1] = Nan::New("Bind succesfuly").ToLocalChecked();
          callback->Call(2, stateClient);
      }
    }
  private:
    std::string bindDN;
    std::string password;
    int result;
    LDAPMessage *resultMsg;
    
};*/

class LDAPBindProgress : public AsyncProgressWorker {
    public:
    LDAPBindProgress(Callback * callback, Callback * progress, LDAP *ld, int msgID) 
        : AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID) {
        
    }
    // Executes in worker thread
    void Execute(const AsyncProgressWorker::ExecutionProgress& progress) {
      struct timeval timeOut;
      timeOut.tv_sec = timeOut.tv_usec = 0L;
      while(result == 0) {
        result = ldap_result(ld, msgID, NULL, &timeOut, &resultMsg);
        progress.Send(reinterpret_cast<const char*>(&result), sizeof(int));
        // Set 1 milliseconds for catch the second callback
        std::this_thread::sleep_for(chrono::milliseconds(1));
      }
    }
    // Executes in event loop
    void HandleOKCallback () {
      Local<Value> stateClient[2] = {Null(), Null()};
      if (result == -1) {
        stateClient[0] = Nan::New("ERROR: Result").ToLocalChecked();
        callback->Call(1, stateClient);
      }
      else {
        int status = ldap_result2error(ld, resultMsg, 0);
        if(status != LDAP_SUCCESS) {
          stateClient[0] = Nan::New<Number>(status);
          callback->Call(1, stateClient);
        }
        stateClient[1] = Nan::New("Bind succesfuly").ToLocalChecked();
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
    private:
    LDAP *ld;
    Callback *progress;
    int result = 0;
    LDAPMessage *resultMsg;
    int msgID;
};


/*NAN_METHOD(initialize) {
  Nan::HandleScope scope;

  Nan::Utf8String hostArg(info[0]);
  std::string hostAddress(*hostArg);
  Callback *callback = new Callback(info[1].As<Function>());

  AsyncQueueWorker(new LDAPInitialization(callback, hostAddress));
}


NAN_METHOD(authentification) {
    Nan::HandleScope scope;

    Utf8String bindDN(info[0]);
    Utf8String password(info[1]);

    char *bind = *bindDN;
    char *pass = *password;

    msgID = ldap_simple_bind(ld, bind, pass);

    Callback *callback = new Callback(info[2].As<Function>());
    Callback *progress = new Callback(info[3].As<v8::Function>());
    
    AsyncQueueWorker(new LDAPBindProgress(callback, progress));
}*/


class LDAPClient : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("LDAPClient").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "initialize", initialize);
    Nan::SetPrototypeMethod(tpl, "bind", bind);
    Nan::SetPrototypeMethod(tpl, "unbind", unbind);
    Nan::SetPrototypeMethod(tpl, "resultMessage", resultMessage);
    Nan::SetPrototypeMethod(tpl, "errCatch", errCatch);
    Nan::SetPrototypeMethod(tpl, "errMessage", errMessage);

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
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String hostArg(info[0]);
    //LDAP *ld = obj->ld;

    char *hostAddress = *hostArg;
    int state;
    int protocol_version = LDAP_VERSION3;
    state = ldap_initialize(&obj->ld, hostAddress);
    if(state != LDAP_SUCCESS || obj->ld == 0) {
      obj->stateClient = 0;
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }

    state = ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if(state != LDAP_SUCCESS) {
      obj->stateClient = 0;
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }
    obj->stateClient = 1;
    info.GetReturnValue().Set(obj->stateClient);
    return;
  }

  static NAN_METHOD(bind) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String userArg(info[0]);
    Nan::Utf8String passArg(info[1]);

    char *username = *userArg;
    char *password = *passArg;

    if(&obj->ld == 0) {
      obj->stateClient = 0;
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }

      obj->msgid = ldap_simple_bind(obj->ld, username, password);

      Callback *callback = new Callback(info[2].As<Function>());
      Callback *progress = new Callback(info[3].As<v8::Function>());

      AsyncQueueWorker(new LDAPBindProgress(callback, progress, obj->ld, obj->msgid));
  }
  
  static NAN_METHOD(resultMessage) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    struct timeval timeOut;
    timeOut.tv_sec = timeOut.tv_usec = 0L;
    int status = 0;

    status = ldap_result(obj->ld, obj->msgid, NULL, &timeOut, &obj->result);
    info.GetReturnValue().Set(status);
    return;
  }

  static NAN_METHOD(errCatch) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    int status;

    status = ldap_result2error(obj->ld, obj->result, 0);
    if(status == LDAP_SUCCESS) {
      ldap_msgfree(obj->result);
    }
    info.GetReturnValue().Set(status);
    return;
  }

  static NAN_METHOD(errMessage) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    if(!info[0] -> IsNumber()) {
      obj->stateClient = 0;
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }
    int errNumber = info[0] -> NumberValue();
    string errReturn = "";

    errReturn = ldap_err2string(errNumber);
    info.GetReturnValue().Set(Nan::New(errReturn).ToLocalChecked());
    ldap_msgfree(obj->result);
    return;
  }

  static NAN_METHOD(unbind) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    if (obj->ld == 0) {
      obj->stateClient = 0;
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }
    ldap_unbind(obj->ld);
    obj->stateClient = 5;
    info.GetReturnValue().Set(obj->stateClient);
    return;
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};

NODE_MODULE(objectwrapper, LDAPClient::Init)


/*NAN_MODULE_INIT(Init) {
  Nan::Set(target, New<String>("initialize").ToLocalChecked(),
       GetFunction(New<FunctionTemplate>(initialize)).ToLocalChecked());
  Nan::Set(target, New<String>("authentification").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(authentification)).ToLocalChecked());
}*/

//NODE_MODULE(Initialization, Init)