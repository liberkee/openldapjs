#include <nan.h>
#include <ldap.h>
#include <iostream>
#include <string>
#include <thread>
#include <chrono>

using namespace Nan;
using namespace v8;
using namespace std;

class LDAPPagedSearchProgress : public AsyncProgressWorker
{
private:
  LDAP *ld;
  Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;
  std::string base;
  std::string filter;
  int scope;
  int pageSize;
  struct berval *cookie;
  std::string pageResult;
  int status = 0;

public:
  LDAPPagedSearchProgress(Callback *callback, Callback *progress, LDAP *ld, std::string base, int scope, std::string filter, int pgSize, struct berval *cookie)
      : AsyncProgressWorker(callback), progress(progress), ld(ld), base(base), scope(scope), filter(filter), pageSize(pgSize), cookie(cookie)
  {
  }
  // Executes in worker thread
  void Execute(const AsyncProgressWorker::ExecutionProgress &progress)
  {
    BerElement *ber;
    int l_rc, l_entries, l_entry_count = 0, morePages, l_errcode = 0, page_nbr;
    struct berval *cookie = nullptr;
    char pagingCriticality = 'T', *l_dn;
    int totalCount = 0;
    LDAPControl *pageControl = nullptr, *M_controls[2] = {nullptr, nullptr}, **returnedControls = nullptr;
    LDAPMessage *l_result, *l_entry;
    int msgId = 0;
    char *attribute;
    char **values;
    /*                                                                */
    /******************************************************************/

    page_nbr = 1;

    /******************************************************************/
    /* Get one page of the returned results each time                 */
    /* through the loop                                               */
    do
    {
      pageResult+="\n";
        l_rc = ldap_create_page_control(ld, pageSize, cookie, pagingCriticality, &pageControl);

        /* Insert the control into a list to be passed to the search.     */
        M_controls[0] = pageControl;

        /* Search for entries in the directory using the parmeters.       */
        l_rc = ldap_search_ext(ld, base.c_str(), scope, filter.c_str(), nullptr, 0, M_controls, nullptr, nullptr, 0, &msgId);
        if ((l_rc != LDAP_SUCCESS))
        {
            status = -1;
        
            break;
        }
       
        int pagedResult = 0;
        struct timeval timeOut = {1, 0};
        while (pagedResult == 0)
        {
            pagedResult = ldap_result(ld, msgId, 1, &timeOut, &l_result);
        }

        /* Parse the results to retrieve the contols being returned.      */
        l_rc = ldap_parse_result(ld, l_result, &l_errcode, nullptr, nullptr, nullptr, &returnedControls, false);

        if (cookie != nullptr)
        {
            ber_bvfree(cookie);
            cookie = nullptr;
        }

        /* Parse the page control returned to get the cookie and          */
        /* determine whether there are more pages.                        */
        l_rc = ldap_parse_page_control(ld, returnedControls, &totalCount, &cookie);

        /* Determine if the cookie is not empty, indicating there are more pages */
        /* for these search parameters. */
        if (cookie && cookie->bv_val != nullptr && (strlen(cookie->bv_val) > 0))
        {
            morePages = true;
        }
        else
        {
            morePages = false;
        }

        /* Cleanup the controls used. */
        if (returnedControls != nullptr)
        {
            ldap_controls_free(returnedControls);
            returnedControls = nullptr;
        }
        M_controls[0] = nullptr;
        ldap_control_free(pageControl);
        pageControl = nullptr;

        /******************************************************************/
        /* Disply the returned result                                     */
        /*                                                                */
        /* Determine how many entries have been found.                    */
        if (morePages == true)
           // printf("===== Page : %d =====\n", page_nbr);
        l_entries = ldap_count_entries(ld, l_result);

        if (l_entries > 0)
        {
            l_entry_count = l_entry_count + l_entries;
        }

        for (l_entry = ldap_first_entry(ld, l_result);
             l_entry != nullptr;
             l_entry = ldap_next_entry(ld, l_entry))
        {
            l_dn = ldap_get_dn(ld, l_entry);
            //printf("    %s\n", l_dn);
            pageResult+="dn: ";
            pageResult+= l_dn;
            pageResult+= "\n";


            for (attribute = ldap_first_attribute(ld, l_entry, &ber);
            attribute != nullptr;
            attribute = ldap_next_attribute(ld, l_entry, ber))
       {
         if ((values = ldap_get_values(ld, l_entry, attribute)) != nullptr)
         {
           for (int i = 0; values[i] != nullptr; i++)
           {
             // printf("%s:",attribute);
              pageResult+= attribute;
              pageResult+= ":";
             //resultLocal += ":";
            // printf("%s\n",values[i]);
             //resultLocal += "\n";
             pageResult+= values[i];
             pageResult+= "\n";
           }
           ldap_value_free(values);
         }
       //  std::cout<<"------173----"<<std::endl;
         ldap_memfree(attribute);
       }
       pageResult+= "\n";
        }

        /* Free the search results.                                       */
        ldap_msgfree(l_result);
        page_nbr+= 1;
        pageResult+="---------";
        pageResult+= std::to_string(page_nbr);
        pageResult+= "------\n";
        

    } while (morePages == true);

  // printf("\n  %d entries found during the search", l_entry_count);
    /* Free the cookie since all the pages for these search parameters   */
    /* have been retrieved.                                              */
    ber_bvfree(cookie);
    cookie = nullptr;

    /* Close the LDAP session.                                           */
    ldap_unbind(ld);
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
      stateClient[1] = Nan::New(pageResult).ToLocalChecked();
      callback->Call(2, stateClient);
    }

    cookie != nullptr ? std::cout << "cookie is not nullptr" << std::endl : std::cout << "cookie is nullptr " << std::endl;
    // ldap_msgfree(resultMsg);
    callback->Reset();
    progress->Reset();
  }

  void HandleProgressCallback(const char *data, size_t size)
  {
    // Required, this is not created automatically
  }
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
    Local<Value> stateClient[2] = {Nan::Null(),Nan::Null()};
    if (result == -1)
    {
      stateClient[0] = Nan::New<Number>(0);
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
        stateClient[1] = Nan::New<Number>(2);
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
  //int LDAP_NO_SUCH_OBJECT = 32;
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

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};

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
    char *dn, *attribute, **values, *matchedDN, *errorMessage = nullptr;
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
      if (resultMsg != nullptr)
      {
        ldap_msgfree(resultMsg);
      }
      return;

    case LDAP_RES_SEARCH_ENTRY:
      flagVerification = true;
      if ((dn = ldap_get_dn(ld, resultMsg)) != nullptr)
      {
        resultLocal += "dn:";
        resultLocal += dn;
        ldap_memfree(dn);
        resultLocal += "\n";
      }

      // You have to implement the attribute side
      entry = ldap_first_entry(ld, resultMsg);
      for (attribute = ldap_first_attribute(ld, entry, &ber);
           attribute != nullptr;
           attribute = ldap_next_attribute(ld, entry, ber))
      {
        if ((values = (char **)(intptr_t)ldap_get_values(ld, entry, attribute)) != nullptr)
        {
          for (i = 0; values[i] != nullptr; i++)
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
      //testVar = *resultMsg;
      status = ldap_result2error(ld, resultMsg, 0);

      prc = ldap_parse_result(ld,
                              resultMsg,
                              &errorCode,
                              &matchedDN,
                              &errorMessage,
                              nullptr,
                              nullptr,
                              1);

      if (matchedDN != nullptr && *matchedDN != 0)
      {
        ldap_memfree(matchedDN);
      }
      break;
    default:
      break;
    }

    Nan::HandleScope scope;
    Local<Value> argv[1] = {Nan::Null()};
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
    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
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
  LDAPMessage *result;
  unsigned int stateClient = 0;
  int msgid;
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
    }
  }

  static NAN_METHOD(initialize)
  {
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
    if (state != LDAP_SUCCESS || obj->ld == 0)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      // Needed for catch a specific error
      obj->initializedFlag = false;
      return;
    }

    state = ldap_set_option(obj->ld, LDAP_OPT_PROTOCOL_VERSION, &protocol_version);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      obj->initializedFlag = false;
      return;
    }

    /*state = ldap_start_tls_s(obj->ld, nullptr, nullptr);
    if(state != LDAP_SUCCESS) {
      stateClient[0] = Nan::New<Number>(state);
      callback->Call(1, stateClient);
      return;
    }*/

    stateClient[1] = Nan::New<Number>(1);
    callback->Call(2, stateClient);
    return;
  }

  static NAN_METHOD(startTls)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[0].As<Function>());

    int state;
    int msgId;

    stateClient[0] = Nan::New<Number>(0);

    state = ldap_start_tls_s(obj->ld, nullptr, nullptr);
    if (state != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      return;
    }
    stateClient[1] = Nan::New<Number>(1);
    callback->Call(2, stateClient);
    return;
  }

  static NAN_METHOD(bind)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());
    Nan::Utf8String userArg(info[0]);
    Nan::Utf8String passArg(info[1]);

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[2].As<Function>());
    Callback *progress = new Callback(info[3].As<v8::Function>());

    char *username = *userArg;
    char *password = *passArg;
    if (obj->ld == 0 || obj->initializedFlag == false)
    {
      stateClient[0] = Nan::New<Number>(0);
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

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    //Verify if the argument is a Number for scope
    if (!info[1]->IsNumber())
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    int scopeSearch = info[1]->NumberValue();
    if (scopeSearch <= 0 && scopeSearch >= 3)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<Number>(0);
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
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      return;
    }

    AsyncQueueWorker(new LDAPSearchProgress(callback, progress, obj->ld, message));
  }

  static NAN_METHOD(pagedSearch)
  {
    LDAPClient *obj = Nan::ObjectWrap::Unwrap<LDAPClient>(info.Holder());

    Nan::Utf8String baseArg(info[0]);
    Nan::Utf8String filterArg(info[2]);

    std::string DNbase = *baseArg;
    std::string filterSearch = *filterArg;
    int message;
    int result;
    struct timeval timeOut = {1, 0};
    struct berval *cookie = nullptr;

    Local<Value> stateClient[2] = {Nan::Null(),Nan::Null()};

    Callback *callback = new Callback(info[4].As<Function>());
    Callback *progress = new Callback(info[5].As<v8::Function>());

    //Verify if the argument is a Number for scope

    int pageSize = info[3]->NumberValue();
    int scopeSearch = info[1]->NumberValue();

    if (obj->ld == 0)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      callback->Reset();
      progress->Reset();
      return;
    }

    /*
    if (result != LDAP_SUCCESS)
    {
      stateClient[0] = Nan::New<Number>(0);
      callback->Call(1, stateClient);
      callback->Reset();
      progress->Reset();
      return;
    } */

    AsyncQueueWorker(new LDAPPagedSearchProgress(callback, progress, obj->ld, DNbase, scopeSearch, filterSearch, pageSize, cookie));
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

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};

    Callback *callback = new Callback(info[3].As<Function>());
    Callback *progress = new Callback(info[4].As<v8::Function>());

    struct berval bvalue;

    bvalue.bv_val = value;
    bvalue.bv_len = strlen(value);

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

    Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    Callback *callback = new Callback(info[0].As<Function>());

    if (obj->ld == nullptr || obj->initializedFlag == false)
    {
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

  static inline Nan::Persistent<v8::Function> &constructor()
  {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }
};

NODE_MODULE(objectwrapper, LDAPClient::Init)
