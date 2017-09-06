#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string.h>
#include <thread>
#include <chrono>
#include <node.h>
#include <lber.h>

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

LDAPControl **ControlHandler(v8::Local<v8::Array> controlObj) {
  LDAPControl **ctrls;
  int controlLength = controlObj->Length();
  LDAPControl c[controlLength];
  int i;
  //std::cout << controlObj << std::endl;
  ctrls = new LDAPControl*[controlLength+1];
  for (i = 0; i < controlLength; i++) {
    v8::Local<v8::Object> control = v8::Local<v8::Object>::Cast(controlObj->Get(Nan::New(i)));
      v8::Local<v8::Object>::Cast(controlObj->Get(Nan::New(i)));
    v8::Local<v8::Array> valueAttr = v8::Local<v8::Array>::Cast(control->Get(Nan::New("value").ToLocalChecked()));
    std::cout << "3" << std::endl;
    int valueAttrLength = valueAttr->Length();
    BerElementBuffer berbuf;
    BerElement *ber = (BerElement *)&berbuf;
    char **attrs = NULL, **res = NULL;
    res = new char*[valueAttrLength + 1];
    for (int j = 0; j <= valueAttrLength; j++) {
      if (j == valueAttrLength) {
        res[j] = NULL;
        break;
      }
      Nan::Utf8String modValues(valueAttr->Get(Nan::New(j)));
      res[j] = strdup(*modValues);
    }
    attrs = res;
    int err;

    ber_init2(ber, nullptr, LBER_USE_DER);
    if(ber_printf(ber, "{v}", attrs) == -1) {
      std::cout << "preread attrs encode failed. \n" << std::endl;
      return NULL;
    }

    err = ber_flatten2(ber, &c[i].ldctl_value, 0);
    if (err < 0) {
      std::cout << "preread attrs encode failed. \n" << std::endl;
      return NULL;
    }

    v8::String::Utf8Value controlOperation(control->Get(Nan::New("oid").ToLocalChecked()));

    if(std::strcmp(*controlOperation, "postread") == 0) {
      c[0].ldctl_oid = LDAP_CONTROL_POST_READ;
    } else if (std::strcmp(*controlOperation, "preread") == 0) {
      c[0].ldctl_oid = LDAP_CONTROL_PRE_READ;
    } else {
      return NULL;
    }

    v8::String::Utf8Value isCriticalFlag(control->Get(Nan::New("iscritical").ToLocalChecked()));
    c[i].ldctl_iscritical = 0;
    ctrls[i] = &c[i];
  }
  i++;
  ctrls[i] = NULL;

  return ctrls;
}

enum StateMachine {
  CREATED = 0,
  INITIALIZED = 1,
  BOUND = 2,
  UNBOUND = 5
};


class LDAPBindProgress : public Nan::AsyncProgressWorker
{
private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

public:
  LDAPBindProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
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
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    if (result == -1)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
    }
    else
    {
      int status = ldap_result2error(ld, resultMsg, 0);
      if (status != LDAP_SUCCESS)
      {
        stateClient[0] = Nan::New<v8::Number>(status);
        callback->Call(1, stateClient);
      }
      else
      {
        stateClient[1] = Nan::New<v8::Number>(StateMachine::BOUND);
        callback->Call(2, stateClient);
      }
    }
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    // Required, this is not created automatically
    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[] = {
        Nan::New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv);
  }
};

class LDAPSearchProgress : public Nan::AsyncProgressWorker
{
private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg, *entry;
  int finished = 0;
  bool flagVerification = false;
  std::string resultSearch;
  int i = 0, msgID;
  LDAPMessage *testVar = 0;
  int status = 0;
public:
  LDAPSearchProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
  {
    struct timeval timeOut = {1, 0};
    while (finished == 0)
    {
      result = ldap_result(ld, msgID, LDAP_MSG_ONE, &timeOut, &resultMsg);
      progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
      std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
  }
  // Executes in event loop
  void HandleOKCallback()
  {

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

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

    std::string resultLocal = "\n";
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

      if (prc != LDAP_SUCCESS) {
        Nan::HandleScope scope;
        v8::Local<v8::Value> argv[1] = {Nan::Null()};
        argv[0] = Nan::New<v8::Number>(2);
        progress->Call(1, argv);
      }

      if (matchedDN != NULL && *matchedDN != 0)
      {
        ldap_memfree(matchedDN);
      }
      break;
    default:
      break;
    }

    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[1] = {Nan::Null()};
    argv[0] = Nan::New(resultLocal).ToLocalChecked();
    progress->Call(1, argv);
    return;
  }
};

class LDAPCompareProgress : public Nan::AsyncProgressWorker
{
private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

public:
  LDAPCompareProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
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
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
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
    v8::Local<v8::Value> argv[] = {
        Nan::New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
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
        if (serverCTL == nullptr) {
          stateClient[1] = Nan::New<v8::Number>(0);
          callback->Call(2, stateClient);
          callback->Reset();
          progress->Reset();
          ldap_msgfree(resultMsg);
          ldap_mods_free(entries, 1);
          return;
        }
        ber = ber_init(&serverCTL[0]->ldctl_value);
        if (ber == NULL) {
          std::cout << "ber is NULL" << std::endl;
          return;
        } else if( ber_scanf(ber, "{m{" /*}}*/ , &bv) == LBER_ERROR) {
          std::cout << "BER error" << std::endl;
          return;
        } else {
          modifyResult += "\n";
          modifyResult += "dn: ";
          modifyResult += bv.bv_val;
          while (ber_scanf(ber, "{m"/*}*/ , &bv) != LBER_ERROR) {
            if (ber_scanf(ber, "[W]", &vals) == LBER_ERROR || vals == NULL) {
              std::cout << "Vals error" << std::endl;
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
      ldap_controls_free(serverCTL);
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
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[1].As<v8::Function>());
    obj->initializedFlag = true;

    char *hostAddress = *hostArg;
    int state;
    int protocol_version = LDAP_VERSION3;

    stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
    state = ldap_initialize(&obj->ld, hostAddress);
    if (state != LDAP_SUCCESS || obj->ld == 0)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      // Needed for catch a specific error
      obj->initializedFlag = false;
      return;
    }

    state = ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      obj->initializedFlag = false;
      return;
    }

    stateClient[1] = Nan::New<v8::Number>(StateMachine::INITIALIZED);
    callback->Call(2, stateClient);
    return;
  }

  static NAN_METHOD(startTls)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());

    int state;

    stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);

    state = ldap_start_tls_s(obj->ld, NULL, NULL);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }
    stateClient[1] = Nan::New<v8::Number>(StateMachine::INITIALIZED);
    callback->Call(2, stateClient);
    return;
  }

  static NAN_METHOD(bind)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String userArg(info[0]);
    Nan::Utf8String passArg(info[1]);

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[3].As<v8::Function>());

    char *username = *userArg;
    char *password = *passArg;
    if (obj->ld == 0 || obj->initializedFlag == false)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
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

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    //Verify if the argument is a Number for scope
    if (!info[1]->IsNumber())
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }

    int scopeSearch = info[1]->NumberValue();
    if (scopeSearch <= 0 && scopeSearch >= 3)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
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
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(1, stateClient);
      return;
    }

    AsyncQueueWorker(new LDAPSearchProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(compare)
  {
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

    result = ldap_compare_ext(obj->ld,
                              DNEntry,
                              attribute,
                              &bvalue,
                              NULL,
                              NULL,
                              &message);

    if (result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(2);
      callback->Call(1, stateClient);
      return;
    }                          
    AsyncQueueWorker(new LDAPCompareProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(newModify) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    // Take the dn from nodejs side
    Nan::Utf8String dn(info[0]);
    //Take the Json object with the elements
    v8::Local<v8::Array> mods = v8::Local<v8::Array>::Cast(info[1]);
    //Get the array member that have the mods values
    v8::Local<v8::Array> controls = v8::Local<v8::Array>::Cast(info[2]);
    
    //Interogate the mod array and set up the mods
    unsigned int nummods = mods->Length();

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    LDAPMod **ldapmods = new LDAPMod*[nummods + 1];
    if (obj->ld == 0 || obj->ld == nullptr) {
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete ldapmods;
      delete callback;
      delete progress;
      return;
    }

    for(unsigned int i = 0; i < nummods; i++) {
      v8::Local<v8::Object> modHandle = v8::Local<v8::Object>::Cast(mods->Get(Nan::New(i)));
        v8::Local<v8::Object>::Cast(mods->Get(Nan::New(i)));
      ldapmods[i] = new LDAPMod;
      v8::String::Utf8Value mod_op(modHandle->Get(Nan::New("op").ToLocalChecked()));

      if(std::strcmp(*mod_op, "add") == 0) {
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

      v8::String::Utf8Value mod_type(modHandle->Get(Nan::New("attr").ToLocalChecked()));
      ldapmods[i]->mod_type = strdup(*mod_type);

      v8::Local<v8::Array> modValsHandle = v8::Local<v8::Array>::Cast(modHandle->Get(Nan::New("vals").ToLocalChecked()));

      int modValsLength = modValsHandle->Length();
      ldapmods[i]->mod_values = new char * [modValsLength + 1];
      for(int j = 0; j < modValsLength; j++) {
        Nan::Utf8String modValue(modValsHandle->Get(Nan::New(j)));
        ldapmods[i]->mod_values[j] = strdup(*modValue);
      }
      ldapmods[i] -> mod_values[modValsLength] = nullptr;
    }
    // LDAPMessage structure for the elements
    ldapmods[nummods] = nullptr;

    int msgID;
    LDAPControl **ctrls;
    //Control for reading the attributes
    if (controls == Nan::Null()) {
      ctrls = NULL;
    } else {
      ctrls = ControlHandler(controls);
    }

    /*LDAPControl **ctrls, c[1];
    ctrls = new LDAPControl*[3];
    BerElementBuffer berbuf;
    BerElement *ber = (BerElement *)&berbuf;
    char **attrs = nullptr, **res = nullptr;
    res = (char **) malloc(sizeof(res) + 20);
    int returnAttrLength = returnAttr->Length();
    for (int z = 0; z <= returnAttrLength; z++) {
      if (z == returnAttrLength) {
        res[z] = nullptr;
        break;
      }
      Nan::Utf8String modValue(returnAttr->Get(Nan::New(z)));
      res[z] = strdup(*modValue);
    }
    

    attrs = res;
    int err;

    ber_init2(ber, nullptr, LBER_USE_DER);
    if(ber_printf(ber, "{v}", attrs) == -1) {
      std::cout << "preread attrs encode failed. \n" << std::endl;
      return;
    }
    
    err = ber_flatten2(ber, &c[0].ldctl_value, 0);
    if (err < 0) {
      std::cout << "preread flatten failed" << std::endl;
      return;
    }

    v8::String::Utf8Value controlOperation(modHandle->Get(Nan::New("prepostControl").ToLocalChecked()));
    
    if(std::strcmp(*controlOperation, "postread") == 0) {
      c[0].ldctl_oid = LDAP_CONTROL_POST_READ;
    } else if (std::strcmp(*controlOperation, "preread") == 0) {
      c[0].ldctl_oid = LDAP_CONTROL_PRE_READ;
    } else {
      stateClient[0] = Nan::New<v8::Number>(2);
      callback->Call(1, stateClient);
      delete ctrls;
      delete ldapmods;
      delete callback;
      delete progress;
      return;
    }

    c[0].ldctl_iscritical = 0;
    ctrls[0] = &c[0];
    ctrls[1] = nullptr;*/

    
    int result = ldap_modify_ext(obj->ld, *dn, ldapmods, ctrls, NULL, &msgID);

    if(result != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<v8::Number>(LDAP_INSUFFICIENT_ACCESS);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    AsyncQueueWorker(new LDAPModifyProgress(callback, progress, obj->ld, msgID, ldapmods));
  }

  static NAN_METHOD(modify) {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String dn(info[0]);
    v8::Local<v8::Array> entryModify = v8::Local<v8::Array>::Cast(info[2]);
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    if(!info[1]->IsNumber()) {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    int operationType = info[1]->NumberValue();
    int length = entryModify->Length();

    if (length < 2 || obj->ld == 0)
    {
      stateClient[0] = Nan::New<v8::Number>(0);
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

    AsyncQueueWorker(new LDAPModifyProgress(callback, progress, obj->ld, msgID, newEntries));
  }

  static NAN_METHOD(unbind)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());

    if (obj->ld == NULL || obj->initializedFlag == false)
    {
      stateClient[0] = Nan::New<v8::Number>(StateMachine::CREATED);
      callback->Call(2, stateClient);
      return;
    }

    ldap_unbind(obj->ld);
    obj->initializedFlag = false;

    stateClient[1] = Nan::New<v8::Number>(StateMachine::UNBOUND);
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
