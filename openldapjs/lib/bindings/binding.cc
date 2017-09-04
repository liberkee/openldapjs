#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string.h>
#include <thread>
#include <chrono>
#include <node.h>
#include <lber.h>
//#include <lber_pvt.h>

#define LBER_ALIGNED_BUFFER(uname, size) \
        union uname { \
          char buffer[size]; \
          int ialign; \
          long lalign; \
          float falign; \
          double dalign; \
          char* palign; \
        }

#define LBER_ELEMENT_SIZEOF (256)
typedef LBER_ALIGNED_BUFFER(lber_berelement_u, LBER_ELEMENT_SIZEOF)
        BerElementBuffer;

using namespace Nan;
using namespace v8;
using namespace std;

enum StateMachine {
  CREATED = 0,
  INITIALIZED = 1,
  BOUND = 2,
  UNBOUND = 5
};


class LDAPBindProgress : public AsyncProgressWorker
{
private:
  LDAP *ld;
  Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

public:
  LDAPBindProgress(Callback *callback, Callback *progress, LDAP *ld, int msgID)
      : AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  // Executes in worker thread
  void Execute(const AsyncProgressWorker::ExecutionProgress &progress)
  {
    struct timeval timeOut = {0, 1};
    while (result == 0)
    {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
      progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
    }
  }
  // Executes in event loop
  void HandleOKCallback()
  {
    Local<Value> stateClient[2] = {Null(), Null()};
    if (result == -1)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
    }
    else
    {
      int status = ldap_result2error(ld, resultMsg, 0);
      if (status != LDAP_SUCCESS)
      {
        stateClient[0] = Nan::New<Number>(status);
        callback->Call(1, stateClient);
      }
      else
      {
        stateClient[1] = Nan::New<Number>(StateMachine::BOUND);
        callback->Call(2, stateClient);
      }
    }
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    // Required, this is not created automatically
    Nan::HandleScope scope;
    Local<Value> argv[] = {
        New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv);
  }
};

class LDAPSearchProgress : public AsyncProgressWorker
{
private:
  LDAP *ld;
  Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg, *entry;
  int finished = 0;
  bool flagVerification = false;
  string resultSearch;
  int i = 0, msgID;
  LDAPMessage *testVar = 0;
  int status = 0;
public:
  LDAPSearchProgress(Callback *callback, Callback *progress, LDAP *ld, int msgID)
      : AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  // Executes in worker thread
  void Execute(const AsyncProgressWorker::ExecutionProgress &progress)
  {
    struct timeval timeOut = {1, 0};
    while (finished == 0)
    {
      result = ldap_result(ld, msgID, LDAP_MSG_ONE, &timeOut, &resultMsg);
      progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
      std::this_thread::sleep_for(chrono::milliseconds(10));
    }
  }
  // Executes in event loop
  void HandleOKCallback()
  {

    Local<Value> stateClient[2] = {Null(), Null()};

    if (status == LDAP_INVALID_DN_SYNTAX || status == LDAP_NO_SUCH_OBJECT)
    {
      stateClient[0] = Nan::New("The Search Operation Failed").ToLocalChecked();
      callback->Call(1, stateClient);
    }
    else
    {
      stateClient[1] = Nan::New(resultSearch).ToLocalChecked();
      callback->Call(2, stateClient);
    }
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    // Required, this is not created automatically
    char *dn, *attribute, **values, *matchedDN, *errorMessage = NULL;
    int errorCode, prc;

    string resultLocal = "\n";
    BerElement *ber;

    switch (result)
    {
    case -1:
      flagVerification = false;
      ldap_perror(ld, "ldap_result");
      return;

    case 0:
      finished = 1;
      if (resultMsg)
      {
        ldap_msgfree(resultMsg);
      }
      return;

    case LDAP_RES_SEARCH_ENTRY:
      flagVerification = true;
      if ((dn = ldap_get_dn(ld, resultMsg)) != NULL)
      {
        resultLocal += "dn:";
        resultLocal += dn;
        ldap_memfree(dn);
        resultLocal += "\n";
      }

      // You have to implement the attribute sideasv
      entry = ldap_first_entry(ld, resultMsg);
      for (attribute = ldap_first_attribute(ld, entry, &ber);
           attribute != NULL;
           attribute = ldap_next_attribute(ld, entry, ber))
      {
        if ((values = (char **)(intptr_t)ldap_get_values(ld, entry, attribute)) != NULL)
        {
          for (i = 0; values[i] != NULL; i++)
          {
            resultLocal += attribute;
            resultLocal += ":";
            resultLocal += values[i];
            resultLocal += "\n";
          }
          ldap_value_free(values);
        }
        ldap_memfree(attribute);
      }
      resultLocal += "\n";
      ber_free(ber, 0);

      resultSearch += resultLocal;
      break;

    case LDAP_RES_SEARCH_RESULT:
      finished = 1;
      status = ldap_result2error(ld, resultMsg, 0);

      prc = ldap_parse_result(ld,
                              resultMsg,
                              &errorCode,
                              &matchedDN,
                              &errorMessage,
                              NULL,
                              NULL,
                              1);

      if (matchedDN != NULL && *matchedDN != 0)
      {
        ldap_memfree(matchedDN);
      }
      break;
    default:
      break;
    }

    Nan::HandleScope scope;
    Local<Value> argv[1] = {Null()};
    argv[0] = Nan::New(resultLocal).ToLocalChecked();
    progress->Call(1, argv);
    return;
  }
};

class LDAPCompareProgress : public AsyncProgressWorker
{
private:
  LDAP *ld;
  Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

public:
  LDAPCompareProgress(Callback *callback, Callback *progress, LDAP *ld, int msgID)
      : AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  // Executes in worker thread
  void Execute(const AsyncProgressWorker::ExecutionProgress &progress)
  {
    struct timeval timeOut = {0, 1};
    while (result == 0)
    {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
      progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
    }
  }
  // Executes in event loop
  void HandleOKCallback()
  {
    Local<Value> stateClient[2] = {Null(), Null()};
    if (result == -1)
    {
      stateClient[1] = Nan::New("The Comparison Result: false").ToLocalChecked();
      callback->Call(2, stateClient);
    }
    else
    {
      int status = ldap_result2error(ld, resultMsg, 0);
      if (status == LDAP_COMPARE_TRUE || status == LDAP_COMPARE_FALSE)
      {
        if (status == LDAP_COMPARE_TRUE)
        {
          stateClient[1] = Nan::New("The Comparison Result: true").ToLocalChecked();
        }
        else
        {
          stateClient[1] = Nan::New("The Comparison Result: false").ToLocalChecked();
        }
        callback->Call(2, stateClient);
      }
      else
      {
        // Return ERROR
        stateClient[0] = Nan::New(status);
        callback->Call(1, stateClient);
      }
    }
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    // Required, this is not created automatically
    Nan::HandleScope scope;
    Local<Value> argv[] = {
        New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv);
  }
};

class LDAPModifyProgress : public Nan::AsyncProgressWorker {
private:
  LDAP *ld;
  Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;
  LDAPMod **entries;
public:
  LDAPModifyProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID, LDAPMod **newEntries)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID), entries(newEntries)
  {
  }
  ~LDAPModifyProgress () {}

  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
  {
    struct timeval timeOut = {0, 1};
    while (result == 0)
    {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
    }
  }

  void HandleOKCallback()
  {
    int status;
    Nan::HandleScope scope;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    int errorCode;
    struct berval bv;
    char *matchedDN, *errorMessage = NULL, **refData = NULL;;
    BerElement *ber;
    LDAPControl **serverCTL;
    BerVarray vals = NULL;
    char *str = NULL;
    std::string modifyResult;

    if (result == -1)
    {
      stateClient[0] = Nan::New<v8::Number>(result);
      callback->Call(1, stateClient);
    }
    else if(result == LDAP_RES_MODIFY)
    {
      status = ldap_result2error(ld, resultMsg, 0);
      if (status != LDAP_SUCCESS)
      {
        stateClient[0] = Nan::New<v8::Number>(status);
        callback->Call(1, stateClient);
      }
      else
      {
        status = ldap_parse_result(ld, resultMsg, &errorCode, &matchedDN, &errorMessage, &refData, &serverCTL, 0);
        ber = ber_init(&serverCTL[0]->ldctl_value);
        if (ber == NULL) {
          cout << "ber is NULL" << endl;
          return;
        } else if( ber_scanf(ber, "{m{" /*}}*/ , &bv) == LBER_ERROR) {
          cout << "BER error" << endl;
          return;
        } else {
          modifyResult += "\n";
          modifyResult += "dn: ";
          modifyResult += bv.bv_val;
          while (ber_scanf(ber, "{m"/*}*/ , &bv) != LBER_ERROR) {
            if (ber_scanf(ber, "[W]", &vals) == LBER_ERROR || vals == NULL) {
              cout << "Vals error" << endl;
              return;
            }
              modifyResult += "\n";
              modifyResult += bv.bv_val;
              modifyResult += ": ";
              modifyResult += vals[0].bv_val;
          }
          modifyResult += "\n";
        }
      }

        stateClient[1] = Nan::New(modifyResult).ToLocalChecked();
        callback->Call(2, stateClient);
      }
      callback->Reset();
      progress->Reset();
      ldap_msgfree(resultMsg);
      ldap_mods_free(entries, 1);
    }

  void HandleProgressCallback(const char *data, size_t size)
  {
  }
};

class LDAPClient : public Nan::ObjectWrap
{
public:
  static NAN_MODULE_INIT(Init)
  {
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

  static NAN_METHOD(New)
  {
    if (info.IsConstructCall())
    {
      LDAPClient *obj = new LDAPClient();
      obj->Wrap(info.This());
    }
    else
    {
      const int argc = 1;
      v8::Local<v8::Value> argv[argc] = {info[0]};
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(cons->NewInstance(argc, argv));
    }
  }

  static NAN_METHOD(initialize)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String hostArg(info[0]);
    Local<Value> stateClient[2] = {Null(), Null()};
    Callback *callback = new Callback(info[1].As<Function>());
    obj->initializedFlag = true;

    char *hostAddress = *hostArg;
    int state;
    int protocol_version = LDAP_VERSION3;

    stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
    state = ldap_initialize(&obj->ld, hostAddress);
    if (state != LDAP_SUCCESS || obj->ld == 0)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      // Needed for catch a specific error
      obj->initializedFlag = false;
      return;
    }

    state = ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      obj->initializedFlag = false;
      return;
    }

    stateClient[1] = Nan::New<Number>(StateMachine::INITIALIZED);
    callback->Call(2, stateClient);
    return;
  }

  static NAN_METHOD(startTls)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Local<Value> stateClient[2] = {Null(), Null()};
    Callback *callback = new Callback(info[0].As<Function>());

    int state;
    int msgId;

    stateClient[0] = Nan::New<Number>(StateMachine::CREATED);

    state = ldap_start_tls_s(obj->ld, NULL, NULL);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }
    stateClient[1] = Nan::New<Number>(StateMachine::INITIALIZED);
    callback->Call(2, stateClient);
    return;
  }

  static NAN_METHOD(bind)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String userArg(info[0]);
    Nan::Utf8String passArg(info[1]);

    Local<Value> stateClient[2] = {Null(), Null()};
    Callback *callback = new Callback(info[2].As<Function>());
    Callback *progress = new Callback(info[3].As<v8::Function>());

    char *username = *userArg;
    char *password = *passArg;
    if (obj->ld == 0 || obj->initializedFlag == false)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }
    obj->msgid = ldap_simple_bind(obj->ld, username, password);
    AsyncQueueWorker(new LDAPBindProgress(callback, progress, obj->ld, obj->msgid));
  }

  static NAN_METHOD(search)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String baseArg(info[0]);
    Nan::Utf8String filterArg(info[2]);

    char *DNbase = *baseArg;
    char *filterSearch = *filterArg;
    int message, result;
    struct timeval timeOut = {10, 0};

    Local<Value> stateClient[2] = {Null(), Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    //Verify if the argument is a Number for scope
    if (!info[1]->IsNumber())
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }

    int scopeSearch = info[1]->NumberValue();
    if (scopeSearch <= 0 && scopeSearch >= 3)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }

    result = ldap_search_ext(obj->ld,
                             DNbase,
                             scopeSearch,
                             filterSearch,
                             NULL,
                             0,
                             NULL,
                             NULL,
                             &timeOut,
                             LDAP_NO_LIMIT,
                             &message);

    if (result != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }

    AsyncQueueWorker(new LDAPSearchProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(compare)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String DNArg(info[0]);
    Nan::Utf8String attrArg(info[1]);
    Nan::Utf8String valueArg(info[2]);

    char *DNEntry = *DNArg;
    char *attribute = *attrArg;
    char *value = *valueArg;
    int message, result;

    Local<Value> stateClient[2] = {Null(), Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    struct berval bvalue;

    bvalue.bv_val = value;
    bvalue.bv_len = strlen(value);

    result = ldap_compare_ext(obj->ld,
                              DNEntry,
                              attribute,
                              &bvalue,
                              NULL,
                              NULL,
                              &message);

    AsyncQueueWorker(new LDAPCompareProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(newModify) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String dn(info[0]);

    v8::Handle<v8::Array> mods = v8::Handle<v8::Array>::Cast(info[1]);
    v8::Handle<v8::Array> returnAttr = v8::Handle<v8::Array>::Cast(info[2]);
    unsigned int nummods = mods->Length();

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    LDAPMod **ldapmods = new LDAPMod*[nummods + 1];

    if (obj->ld == 0 || obj->ld == NULL) {
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete ldapmods;
      delete callback;
      delete progress;
      return;
    }

    for(unsigned int i = 0; i < nummods; i++) {
      Local<Object> modHandle = Local<Object>::Cast(mods->Get(Nan::New(i)));
        Local<Object>::Cast(mods->Get(Nan::New(i)));
      ldapmods[i] = new LDAPMod;
      String::Utf8Value mod_op(modHandle->Get(Nan::New("op").ToLocalChecked()));

      if(std::strcmp(*mod_op, "add") == 0) {
        ldapmods[i]->mod_op = LDAP_MOD_ADD;
      } else if (std::strcmp(*mod_op, "delete") == 0) {
        ldapmods[i]->mod_op = LDAP_MOD_DELETE;
      } else if (std::strcmp(*mod_op, "replace") == 0) {
        ldapmods[i]->mod_op = LDAP_MOD_REPLACE;
      } else {
        stateClient[0] = Nan::New<Number>(LDAP_INVALID_SYNTAX);
        callback->Call(1, stateClient);
        delete ldapmods;
        delete callback;
        delete progress;
        return;
      }

      String::Utf8Value mod_type(modHandle->Get(Nan::New("attr").ToLocalChecked()));
      ldapmods[i]->mod_type = strdup(*mod_type);

      Local<Array> modValsHandle = Local<Array>::Cast(modHandle->Get(Nan::New("vals").ToLocalChecked()));

      int modValsLength = modValsHandle->Length();
      ldapmods[i]->mod_values = new char * [modValsLength + 1];
      for(int j = 0; j < modValsLength; j++) {
        Nan::Utf8String modValue(modValsHandle->Get(Nan::New(j)));
        ldapmods[i]->mod_values[j] = strdup(*modValue);
      }
      ldapmods[i] -> mod_values[modValsLength] = NULL;
    }

    ldapmods[nummods] = NULL;
    int msgID;

    LDAPControl **ctrls, c[1];
    ctrls = (LDAPControl**) malloc(sizeof(c) + 3 *sizeof(LDAPControl*));
    char *control, *cvalue, *optarg = "postread=entryCSN", *postread_attrs = NULL;
    BerElementBuffer berbuf;
    BerElement *ber = (BerElement *)&berbuf;
    char **attrs = NULL, **res = NULL;
    res = (char **) malloc(sizeof(res) + 20);
    int returnAttrLength = returnAttr->Length();
    for (int z = 0; z <= returnAttrLength; z++) {
      if (z == returnAttrLength) {
        res[z] = NULL;
        break;
      }
      Nan::Utf8String modValue(returnAttr->Get(Nan::New(z)));
      res[z] = strdup(*modValue);
    }

    attrs = res;
    int err;

    ber_init2(ber, NULL, LBER_USE_DER);
    if(ber_printf(ber, "{v}", attrs) == -1) {
      cout << "preread attrs encode failed. \n" << endl;
      return;
    }
    
    err = ber_flatten2(ber, &c[0].ldctl_value, 0);
    if (err < 0) {
      cout << "preread flatten failed" << endl;
      return;
    }

    c[0].ldctl_oid = LDAP_CONTROL_PRE_READ;
    c[0].ldctl_iscritical = 0;
    ctrls[0] = &c[0];
    ctrls[1] = NULL;

    //err = ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, ctrls);
   
    int result = ldap_modify_ext(obj->ld, *dn, ldapmods, ctrls, NULL, &msgID);
    free(ctrls);

    if(/*controlResult != LDAP_SUCCESS || */result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete ldapmods;
      delete callback;
      delete progress;
      return;
    }


    AsyncQueueWorker(new LDAPModifyProgress(callback, progress, obj->ld, msgID, ldapmods));
  }

  static NAN_METHOD(modify) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String dn(info[0]);
    Local<Array> entryModify = Local<Array>::Cast(info[2]);
    Local<Value> stateClient[2] = {Null(), Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    if(!info[1]->IsNumber()) {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    int operationType = info[1]->NumberValue();
    int length = entryModify->Length();

    if (length < 2 || obj->ld == 0)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    LDAPMod **newEntries = new LDAPMod *[length / 2 + 1];
    for (int i = 0; i < length / 2; i++)
    {
      Nan::Utf8String type(entryModify->Get(2 * i));
      std::string typeString(*type);
      Nan::Utf8String value(entryModify->Get(2 * i + 1));
      std::string valueString(*value);

      newEntries[i] = new LDAPMod;

      if (typeString.length() > 0 && valueString.length() > 0)
      {
        newEntries[i]->mod_type = new char[typeString.length() + 1];
        newEntries[i]->mod_values = new char *[2];
        newEntries[i]->mod_values[0] = new char[valueString.length() + 1];

        newEntries[i]->mod_op = operationType;
        memcpy(newEntries[i]->mod_type, typeString.c_str(), typeString.length() + 1);
        memcpy(newEntries[i]->mod_values[0], valueString.c_str(), valueString.length() + 1);
        newEntries[i]->mod_values[1] = NULL;
      }
    }

    newEntries[length / 2] = NULL;
    char *dns = *dn;
    int msgID = 0;

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int result = ldap_modify_ext(obj->ld, dns, newEntries, NULL, NULL, &msgID);

    AsyncQueueWorker(new LDAPModifyProgress(callback, progress, obj->ld, msgID, newEntries));
  }

  static NAN_METHOD(unbind)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Local<Value> stateClient[2] = {Null(), Null()};
    Callback *callback = new Callback(info[0].As<Function>());

    if (obj->ld == NULL || obj->initializedFlag == false)
    {
      stateClient[0] = Nan::New<Number>(StateMachine::CREATED);
      callback->Call(2, stateClient);
      return;
    }

    ldap_unbind(obj->ld);
    obj->initializedFlag = false;

    stateClient[1] = Nan::New<Number>(StateMachine::UNBOUND);
    callback->Call(2, stateClient);

    return;
  }

  static inline Nan::Persistent<v8::Function> &constructor()
  {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }
};

NODE_MODULE(objectwrapper, LDAPClient::Init)
