#include "ldap_search_progress.h"

LDAPSearchProgress::LDAPSearchProgress(Callback *callback, Callback *progress, LDAP *ld,
    int msgID)
: AsyncProgressWorker(callback), progress(progress), ld(ld),
msgID(msgID) {}

void LDAPSearchProgress::Execute(const AsyncProgressWorker::ExecutionProgress &progress) {
    struct timeval timeOut = {1, 0};
    while (finished == 0) {
      result = ldap_result(ld, msgID, LDAP_MSG_ONE, &timeOut, &resultMsg);
      progress.Send(reinterpret_cast<const char *>(&result), sizeof(int));
      std::this_thread::sleep_for(chrono::milliseconds(10));
    }
  }

   // Executes in event loop
   void LDAPSearchProgress::HandleOKCallback() {
    
        Local<Value> stateClient[2] = {Nan::Null(), Nan::Null()};
    
        if (status == LDAP_INVALID_DN_SYNTAX || status == LDAP_NO_SUCH_OBJECT) {
          stateClient[0] = Nan::New("The Search Operation Failed").ToLocalChecked();
          callback->Call(1, stateClient);
        } else {
          stateClient[1] = Nan::New(resultSearch).ToLocalChecked();
          callback->Call(2, stateClient);
        }
      }

      void LDAPSearchProgress::HandleProgressCallback(const char *data, size_t size) {
        // Required, this is not created automatically
        char *dn, *attribute, **values, *matchedDN, *errorMessage = nullptr;
        int errorCode, prc;
    
        string resultLocal = "\n";
        BerElement *ber;
    
        switch (result) {
        case -1:
          flagVerification = false;
          ldap_perror(ld, "ldap_result");
          return;
    
        case 0:
          finished = 1;
          if (resultMsg != nullptr) {
            ldap_msgfree(resultMsg);
          }
          return;
    
        case LDAP_RES_SEARCH_ENTRY:
          flagVerification = true;
          if ((dn = ldap_get_dn(ld, resultMsg)) != nullptr) {
            resultLocal += "dn:";
            resultLocal += dn;
            ldap_memfree(dn);
            resultLocal += "\n";
          }
    
          // You have to implement the attribute side
          entry = ldap_first_entry(ld, resultMsg);
          for (attribute = ldap_first_attribute(ld, entry, &ber);
               attribute != nullptr;
               attribute = ldap_next_attribute(ld, entry, ber)) {
            if ((values = (char **)(intptr_t)ldap_get_values(
                     ld, entry, attribute)) != nullptr) {
              for (i = 0; values[i] != nullptr; i++) {
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
    
          prc = ldap_parse_result(ld, resultMsg, &errorCode, &matchedDN,
                                  &errorMessage, nullptr, nullptr, 1);
    
          if (matchedDN != nullptr && *matchedDN != 0) {
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
    