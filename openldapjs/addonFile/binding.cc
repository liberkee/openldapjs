#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string>

using namespace Nan;
using namespace v8;
using namespace std;

LDAP *ld;

class LDAPInitialization : public AsyncWorker {
  public:
    LDAPInitialization(Callback * callback, std::string hostArg)
    : AsyncWorker(callback), hostArg(hostArg), result(0){
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
    
};

/*class LDAPBind : public AsyncWorker {
  LDAPBind(Callback * callback, char *bindDN, char *password)
  : AsyncWorker(callback), bindDN(bindDN), password(password){}
  
  private:
  char *bindDN;
  char *password;
  int result;
};*/

NAN_METHOD(initialize) {
  Nan::HandleScope scope;

  Nan::Utf8String hostArg(info[0]);
  std::string hostAddress(*hostArg);
  Callback *callback = new Callback(info[1].As<Function>());

  AsyncQueueWorker(new LDAPInitialization(callback, hostAddress));
}

/*NAN_METHOD(bind) {
  Nan::HandleScope scope;

  Nan::Utf8String bindDN(info[0]);
  Nan::Utf8String password(info[0]);
  //char *hostAddress = *hostArg;
  Callback *callback = new Callback(info[1].As<Function>());

  AsyncQueueWorker(new LDAPBind(callback, *bindDN, *password));
}*/

NAN_MODULE_INIT(Init) {
  Nan::Set(target, New<String>("initialize").ToLocalChecked(),
       GetFunction(New<FunctionTemplate>(initialize)).ToLocalChecked());
  /*Nan::Set(target, New<String>("bind").ToLocalChecked(),
       GetFunction(New<FunctionTemplate>(bind)).ToLocalChecked());*/
}

NODE_MODULE(initialize, Init)