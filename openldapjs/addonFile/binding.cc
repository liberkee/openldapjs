#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string>
#include <thread>
#include <chrono>

using namespace Nan;
using namespace v8;
using namespace std;

LDAP *ld;
int msgID;

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

class LDAPBind : public AsyncWorker {
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
    
};

class LDAPBindProgress : public AsyncProgressWorker {
    public:
    LDAPBindProgress(Callback * callback, Callback * progress) 
        : AsyncProgressWorker(callback), progress(progress) {
        
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
    Callback *progress;
    int result = 0;
    LDAPMessage *resultMsg;
};


NAN_METHOD(initialize) {
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
}


NAN_MODULE_INIT(Init) {
  Nan::Set(target, New<String>("initialize").ToLocalChecked(),
       GetFunction(New<FunctionTemplate>(initialize)).ToLocalChecked());
  Nan::Set(target, New<String>("authentification").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(authentification)).ToLocalChecked());
}

NODE_MODULE(Initialization, Init)