#ifndef BINDINGS_LDAP_SEARCH_PROGRESS_H_
#define BINDINGS_LDAP_SEARCH_PROGRESS_H_

#include <chrono>
#include <iostream>
#include <ldap.h>
#include <map>
#include <nan.h>
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
  int i = 0, msgID;
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

#endif // BINDINGS_LDAP_SEARCH_PROGRESS_H_