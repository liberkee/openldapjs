

#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string>
#include <thread>
#include <chrono>



class LDAPAddProgress : public Nan::AsyncProgressWorker
{
private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;
  LDAPMod **entries;

public:
  LDAPAddProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID, LDAPMod **newEntries)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID), entries(newEntries)
  {
  }
  ~LDAPAddProgress() {}
  //Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
  {
    struct timeval timeOut = {0, 1};
    while (result == 0)
    {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);

      //progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
      //std::this_thread::sleep_for(chrono::milliseconds(10));
    }
  }

  void HandleOKCallback()
  {
    Nan::HandleScope scope;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    if (result == -1)
    {
      stateClient[0] = Nan::New<v8::Number>(result);
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
        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
    }
    ldap_msgfree(resultMsg); //  we should free this here?.
    ldap_mods_free(entries, 1);
    callback->Reset();
    progress->Reset();
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    /*
    // Required, this is not created automatically
    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[] = {
        New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv);
    */
  }
};

class LDAPDeleteProgress : public Nan::AsyncProgressWorker
{
private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

public:
  LDAPDeleteProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  //Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
  {
    struct timeval timeOut = {0, 1};
    while (result == 0)
    {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
      // progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
      // std::this_thread::sleep_for(chrono::milliseconds(10));
    }
  }

  void HandleOKCallback()
  {
    Nan::HandleScope scope;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    if (result == -1)
    {
      stateClient[0] = Nan::New<v8::Number>(result);
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
        stateClient[1] = Nan::New<v8::Number>(0);
        callback->Call(2, stateClient);
      }
    }
    callback->Reset();
    progress->Reset();
    ldap_msgfree(resultMsg);
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    /* progress.send what ?
    // Required, this is not created automatically
    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[] = {
        New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv);
    */
  }
};

class LDAPBindProgress : public Nan::AsyncProgressWorker
{
private:
  LDAP *ld;
  Nan::Callback *progress;
  int result;
  LDAPMessage *resultMsg;
  int msgID;

public:
  LDAPBindProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  ~LDAPBindProgress() {}
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
  {
    result = 0;
    struct timeval timeOut = {0, 1};
    while (result == 0)
    {
      result = ldap_result(ld, msgID, 1, &timeOut, &resultMsg);
      //progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
    }
  }
  // Executes in event loop
  void HandleOKCallback()
  {
    Nan::HandleScope scope;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    if (result == -1)
    {
      stateClient[0] = Nan::New<v8::Number>(result);
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
        stateClient[1] = Nan::New<v8::Number>(2);
        callback->Call(2, stateClient);
      }
    }
    callback->Reset();
    progress->Reset();
    ldap_msgfree(resultMsg); //testing this out
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    // Required, this is not created automatically
    /*
    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[] = {
        New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv); */
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
  int status = 0;

public:
  LDAPSearchProgress(Nan::Callback *callback, Nan::Callback *progress, LDAP *ld, int msgID)
      : Nan::AsyncProgressWorker(callback), progress(progress), ld(ld), msgID(msgID)
  {
  }
  // Executes in worker thread
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress)
  {

    char *dn;
    char *attribute;
    char **values;
    char *matchedDN;
    char *errorMessage = nullptr;
    int errorCode;
    int prc;

    std::string resultLocal = "\n";
    BerElement *ber;

    struct timeval timeOut = {1, 0};
    while (finished == 0)
    {
      result = ldap_result(ld, msgID, LDAP_MSG_ONE, &timeOut, &resultMsg);
      resultLocal.clear();
      resultLocal = "\n";

      switch (result)
      {
      case -1:
        flagVerification = false;
        ldap_perror(ld, "ldap_result");
        return;

      case 0:
        break;

      case LDAP_RES_SEARCH_ENTRY:
        flagVerification = true;
        if ((dn = ldap_get_dn(ld, resultMsg)) != NULL)
        {
          resultLocal += "dn:";
          resultLocal += dn;
          ldap_memfree(dn);

          resultLocal += "\n";
        }

        // You have to implement the attribute side
        for (attribute = ldap_first_attribute(ld, resultMsg, &ber);
             attribute != NULL;
             attribute = ldap_next_attribute(ld, resultMsg, ber))
        {
          if ((values = ldap_get_values(ld, resultMsg, attribute)) != NULL)
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
        ldap_msgfree(resultMsg);

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
                                nullptr,
                                nullptr,
                                1);

        if (prc != LDAP_SUCCESS)
        {
          //in case of error ?
          std::cout << "parse result failed with:" << ldap_err2string(prc) << std::endl;
          return;
        }

        if (matchedDN != NULL && *matchedDN != 0)
        {
          ldap_memfree(matchedDN);
        }

        if (errorMessage != NULL)
        {
          ldap_memfree(errorMessage);
        }
        break;
      default:
        break;
      }

      // char *resultPointer = new char[resultLocal.length()];
      // resultPointer = strdup(resultLocal.c_str());

      //progress.Send(resultPointer, resultLocal.length());

      //delete resultPointer; //potentialy dangerous ?
    }
  }
  // Executes in event loop
  void HandleOKCallback()
  {
    Nan::HandleScope scope;
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    if (status != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New(status);
      callback->Call(1, stateClient);
    }
    else
    {
      stateClient[1] = Nan::New(resultSearch).ToLocalChecked();
      callback->Call(2, stateClient);
    }

    callback->Reset();
    progress->Reset();
  }

  void HandleProgressCallback(const char *data, size_t size)
  { /*
    Nan::HandleScope scope;

    //Nan::HandleScope scope;
    v8::Local<v8::Value> argv[1] = {Null()};
    argv[0] = Nan::New(data).ToLocalChecked();

    progress->Call(1, argv);
    //delete[] data; */
  }
};

class LDAPCompareProgress : public Nan::AsyncProgressWorker
{
private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID = 0;

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
    Nan::HandleScope scope;
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
    callback->Reset();
    progress->Reset();
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    /*
    // Required, this is not created automatically
    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[] = {
        New<v8::Number>(*reinterpret_cast<int *>(const_cast<char *>(data)))};
    progress->Call(1, argv);
    */
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
    Nan::SetPrototypeMethod(tpl, "compare", compare);
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
  int msgid = 0;
  bool initializedFlag = false;
  explicit LDAPClient(){};
  //LDAPMod *attrs[4];

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
      //info.GetReturnValue().Set(Nan::NewInstance(cons,argc,argv).ToLocalChecked()); ?
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
    int protocol_version = LDAP_VERSION3;

    int state = ldap_initialize(&obj->ld, hostAddress);
    if (state != LDAP_SUCCESS || obj->ld == 0)
    {
      stateClient[0] = Nan::New<v8::Number>(state);
      callback->Call(1, stateClient);
      // Needed for catch a specific error
      obj->initializedFlag = false;
      delete callback;
      return;
    }

    state = ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<v8::Number>(state);
      callback->Call(1, stateClient);
      obj->initializedFlag = false;
      delete callback;
      return;
    }

    stateClient[1] = Nan::New<v8::Number>(1);
    callback->Call(2, stateClient);
    callback->Reset();
    delete callback;
    callback = nullptr;
    return;
  }

  static NAN_METHOD(startTls)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());
    stateClient[0] = Nan::New<v8::Number>(0);

    int state = ldap_start_tls_s(obj->ld, nullptr, nullptr);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      callback = nullptr;
      return;
    }
    stateClient[1] = Nan::New<v8::Number>(1);
    callback->Call(2, stateClient);
    delete callback;
    callback = nullptr;
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
    if (obj->ld == 0) //|| obj->initializedFlag == false)
    {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      //should be freed and deleted as well ?
      //  callback->Reset();
      // progress->Reset();
      delete callback;
      delete progress;

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

    int scopeSearch = info[1]->NumberValue();

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    result = ldap_search_ext(obj->ld,
                             DNbase,
                             scopeSearch,
                             filterSearch,
                             nullptr,
                             0,
                             nullptr,
                             nullptr,
                             &timeOut,
                             LDAP_NO_LIMIT,
                             &message);

    if (result != LDAP_SUCCESS)
    {

      stateClient[0] = Nan::New<v8::Number>(0);
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
    int message = 0, result = 0;

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    struct berval bvalue;

    bvalue.bv_val = value;
    bvalue.bv_len = strlen(value); // isn't a +1 required for the \0 ?

    result = ldap_compare_ext(obj->ld,
                              DNEntry,
                              attribute,
                              &bvalue,
                              nullptr,
                              nullptr,
                              &message);

    AsyncQueueWorker(new LDAPCompareProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(unbind)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());

    if (obj->ld == NULL || obj->initializedFlag == false)
    {
      std::cout << "unbind error?:" << std::endl;
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(2, stateClient);
      delete callback;
      return;
    }

    int unbindResult = ldap_unbind(obj->ld);

    if (unbindResult != LDAP_SUCCESS)
    {
      std::cout << "unbind failed with error code:" << unbindResult << std::endl;
    }
    obj->initializedFlag = false;

    stateClient[1] = Nan::New<v8::Number>(5);
    callback->Call(2, stateClient);

    //freeing callbacks ?
    // callback->Reset();set();
    delete callback;
    callback = nullptr;

    return;
  }

  static NAN_METHOD(del)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Utf8String dn(info[0]);
    Nan::Utf8String controls(info[1]);

    char *dns = *dn;

    int msgID = 0;

    Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());
    Nan::Callback *progress = new Nan::Callback(info[3].As<v8::Function>());

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      callback->Reset();
      delete callback;
      progress->Reset();
      delete progress;
      return;
    }

    int result = ldap_delete_ext(obj->ld, dns, nullptr, nullptr, &msgID);

    AsyncQueueWorker(new LDAPDeleteProgress(callback, progress, obj->ld, msgID));
  }

  /**
 ** Method that calls the ldap_add_ext routine.
 ** The entries are taken from a string array 2 by 2 in a for loop (LDAPMods.mod_type and LDAPMods.mod_values respectively)
 ** entries are placed in the LDAPMod *newEntries[] array alocating memory in each iteration.
 ** Note: both the last value in mod_values array and in the newEntries array has to be NULL
 **/

  static NAN_METHOD(add)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    v8::Local<v8::Array> entries = v8::Local<v8::Array>::Cast(info[1]);
    v8::Local<v8::Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Nan::Utf8String dn(info[0]);
    Nan::Utf8String controls(info[2]);

    int length = entries->Length();
    if (length < 2)
    {
      return;
    }

    LDAPMod **newEntries = new LDAPMod *[length / 2 + 1];
    for (int i = 0; i < length / 2; i++)
    {
      Nan::Utf8String type(entries->Get(2 * i));
      std::string typeString(*type);
      Nan::Utf8String value(entries->Get(2 * i + 1));
      std::string valueString(*value);

      newEntries[i] = new LDAPMod;

      if (typeString.length() > 0 && valueString.length() > 0)
      {
        newEntries[i]->mod_type = new char[typeString.length() + 1];
        newEntries[i]->mod_values = new char *[2];
        newEntries[i]->mod_values[0] = new char[valueString.length() + 1];

        newEntries[i]->mod_op = LDAP_MOD_ADD;
        memcpy(newEntries[i]->mod_type, typeString.c_str(), typeString.length() + 1);
        memcpy(newEntries[i]->mod_values[0], valueString.c_str(), valueString.length() + 1);
        newEntries[i]->mod_values[1] = NULL;
      }
    }

    newEntries[length / 2] = NULL;

    char *dns = *dn;
    int msgID = 0;

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>()); //free ?
    Nan::Callback *progress = new Nan::Callback(info[4].As<v8::Function>());

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      delete callback;
      delete progress;
      return;
    }

    int result = ldap_add_ext(obj->ld, dns, newEntries, nullptr, nullptr, &msgID);

    //ldap_mods_free(newEntries, 1);

    /*
    if (result != 0)
    {
      stateClient[0] = Nan::New<v8::Number>(0);
      callback->Call(1, stateClient);
      return;
    }*/
    AsyncQueueWorker(new LDAPAddProgress(callback, progress, obj->ld, msgID, newEntries));
  }

  static inline Nan::Persistent<v8::Function> &constructor()
  {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }
};


NODE_MODULE(objectwrapper, LDAPClient::Init)
