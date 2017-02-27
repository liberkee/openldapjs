#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string>

using namespace v8;
using namespace std;

//Create the LDAP object
class LDAPClient : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("LDAPClient").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "initialize", initialize);
    Nan::SetPrototypeMethod(tpl, "getState", getState);
    //Nan::SetPrototypeMethod(tpl, "bind", bind);
    //Nan::SetPrototypeMethod(tpl, "search", search);
    //Nan::SetPrototypeMethod(tpl, "compare", compare);
    //Nan::SetPrototypeMethod(tpl, "unbind", unbind);

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("LDAPClient").ToLocalChecked(),
      Nan::GetFunction(tpl).ToLocalChecked());
  }

 protected:
   /*virtual void Unref()
   {
	   std::cout << "Unref" << value_ << std::endl;
   }*/ 
 private:
  LDAP *ld;
  unsigned int stateClient = 0;
  explicit LDAPClient(){};
  ~LDAPClient() {
	  //std::cout << "Destruct" << value_ << std::endl;
  }

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

  /*static NAN_METHOD(GetHandle) {
    MyObject* obj = Nan::ObjectWrap::Unwrap<MyObject>(info.Holder());
    info.GetReturnValue().Set(obj->handle());
  }*/

  static NAN_METHOD(getState) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    info.GetReturnValue().Set(obj->stateClient);
  }

  static NAN_METHOD(initialize) {
    LDAPClient* obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String hostArg(info[0]);
    LDAP *ld = obj->ld;

    char *hostAddress = *hostArg;
    int state;
    int protocol_version = LDAP_VERSION3;

    state = ldap_initialize(&ld, hostAddress);
    if(state != LDAP_SUCCESS) {
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }

    state = ldap_set_option(ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if(state != LDAP_SUCCESS) {
      info.GetReturnValue().Set(obj->stateClient);
      return;
    }
    obj->stateClient = 1;
    info.GetReturnValue().Set(obj->stateClient);
    return;
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

  //double value_;
};

NODE_MODULE(objectwrapper, LDAPClient::Init)


//-----------------------------------------------------------------------------//

// initialize the LDAP library without opening a connection to a server
/*void initialize(const Nan::FunctionCallbackInfo<Value>& info) {
  Nan::Utf8String hostArg(info[0]);

  char *hostAddress = *hostArg;
  int state;
  bool result = true;
  int protocol_version = LDAP_VERSION3;

  state = ldap_initialize(&ld, hostAddress);
  if(state != LDAP_SUCCESS) {
    result = false;
    info.GetReturnValue().Set(result);
    return;
  }

  state = ldap_set_option(ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
  if(state != LDAP_SUCCESS) {
    result = false;
    info.GetReturnValue().Set(result);
    return;
  }
  info.GetReturnValue().Set(result);
  return;
}

// This function will take two arguments (DN and password) and bind to server if the creadentials are not corect will return an error message
void bind(const Nan::FunctionCallbackInfo<Value>& info) {
  Nan::Utf8String userArg(info[0]);
  Nan::Utf8String passArg(info[1]);

  char *username = *userArg;
  char *password = *passArg;
  int status;
  bool result = true;
  
  status = ldap_simple_bind_s(ld, username, password);
  if(status != LDAP_SUCCESS) {
    result = false;
    info.GetReturnValue().Set(result);
    return;
  }
  cout << LDAP_SCOPE_SUBTREE << endl << endl;
  info.GetReturnValue().Set(result);
  return;
}

//The search make a request to a LDAP server for specific information
void search(const Nan::FunctionCallbackInfo<Value>& info) {

  //Takes the argument given by nodeJS and make it string
  Nan::Utf8String baseArg(info[0]);
  Nan::Utf8String filterArg(info[2]);

  char *DNbase = *baseArg;
  char *filterSearch = *filterArg;
  int status, i;
  struct timeval timeOut = {1,0};
  char *dn, *attribute, **values;

  // create the structure of LDAPMessage for registering the response from server
  LDAPMessage *searchResult, *entry;
  BerElement *ber;
  string returnValue = "\n";

  //Verify if the argument is a Number for scope
  if(!info[1] -> IsNumber()) {
    Nan::ThrowTypeError("Argument must be number");
    return;
  }
  int scopeSearch = info[1]->NumberValue();
  if (scopeSearch <= 0 && scopeSearch >= 3) {
    Nan::ThrowTypeError("No other type of scope");
    return;
  }

  // request a search to LDAP server
  status = ldap_search_ext_s(ld, 
                            DNbase, 
                            scopeSearch, 
                            filterSearch, 
                            NULL, 
                            0, 
                            NULL, 
                            NULL, 
                            &timeOut, 
                            LDAP_NO_LIMIT, 
                            &searchResult);

  if (status != LDAP_SUCCESS) {
    Nan::ThrowTypeError("Search failed");
    ldap_msgfree(searchResult);
    return;
  }

  //take every node from result and print it
  for (entry = ldap_first_entry(ld, searchResult);
      entry != NULL;
      entry = ldap_next_entry(ld, entry)) {
        //print the dn
        if((dn = ldap_get_dn(ld, entry)) != NULL) {
          returnValue += "dn:";
          returnValue += dn;
          returnValue += "\n";
          ldap_memfree(dn);
        }
        //print the attribute of specific entry
      for(attribute = ldap_first_attribute (ld, entry, &ber);
          attribute != NULL;
          attribute = ldap_next_attribute(ld, entry, ber) ) {
            if((values = (char **)(intptr_t)ldap_get_values(ld,entry,attribute)) != NULL) {
              for(i=0; values[i] != NULL; i++) {
                returnValue += attribute;
                returnValue += ":";
                returnValue += values[i];
                returnValue += "\n";
              }
              ldap_value_free(values);
            }
            ldap_memfree(attribute);
      }
      ber_free(ber, 0);
    }
    ldap_msgfree(searchResult);
    info.GetReturnValue().Set(Nan::New(returnValue).ToLocalChecked());
    return;
}

// synchronously compare to a directory entry
void compare(const Nan::FunctionCallbackInfo<Value>& info) {
  
  Nan::Utf8String DNArg(info[0]);
  Nan::Utf8String attrArg(info[1]);
  Nan::Utf8String valueArg(info[2]);

  char *DNEntry = *DNArg;
  char *attribute = *attrArg;
  char *value = *valueArg;
  int status;
  bool result = true;

  struct berval bvalue;

  bvalue.bv_val = value;
  bvalue.bv_len = strlen(value);

  status = ldap_compare_ext_s(ld,
                    DNEntry,
                    attribute,
                    &bvalue,
                    NULL,
                    NULL);
  if(status != LDAP_COMPARE_TRUE && status == LDAP_NO_SUCH_ATTRIBUTE && status == LDAP_NO_SUCH_OBJECT) {
    result = false;
    info.GetReturnValue().Set(result);
    return;
  }
  info.GetReturnValue().Set(result);
  return;
}

//Unbind from server information and free the ld structure
void unbind(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  ldap_unbind_s(ld);
}

 //Define the functions that will be transfered to nodeJS
void Init(Local<Object> exports, Local<Object> module) {
  exports->Set(Nan::New("initialize").ToLocalChecked(),
               Nan::New<FunctionTemplate>(initialize)->GetFunction());
  exports->Set(Nan::New("bind").ToLocalChecked(),
               Nan::New<FunctionTemplate>(bind)->GetFunction());
  exports->Set(Nan::New("search").ToLocalChecked(),
               Nan::New<FunctionTemplate>(search)->GetFunction());
  exports->Set(Nan::New("unbind").ToLocalChecked(),
               Nan::New<FunctionTemplate>(unbind)->GetFunction());
  exports->Set(Nan::New("compare").ToLocalChecked(),
               Nan::New<FunctionTemplate>(compare)->GetFunction());
}

NODE_MODULE(function, Init)
*/
