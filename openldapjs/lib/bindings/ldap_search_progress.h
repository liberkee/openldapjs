#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include <chrono>
#include <iostream>
#include <map>
#include <string>
#include <thread>

using namespace Nan;
using namespace v8;
using namespace std;

class LDAPSearchProgress : public AsyncProgressWorker {
 private:
  LDAP *ld;
  Callback *progress;
  int result = 0;
  int finished = 0;
  bool flagVerification = false;
  string resultSearch;
  int i = 0;
  int msgID;
  int status = 0;

 public:
  LDAPSearchProgress(Callback *callback, Callback *progress, LDAP *ld,
                     int msgID);

  // Executes in worker thread
  void Execute(const AsyncProgressWorker::ExecutionProgress &progress);

  // Executes in event loop
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_SEARCH_PROGRESS_H_
