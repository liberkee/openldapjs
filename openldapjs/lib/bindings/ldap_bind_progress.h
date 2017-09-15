#ifndef BINDINGS_LDAP_BIND_PROGRESS_H_
#define BINDINGS_LDAP_BIND_PROGRESS_H_

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

class LDAPBindProgress : public AsyncProgressWorker {
 private:
  LDAP *ld;
  Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

 public:
  LDAPBindProgress(Callback *callback, Callback *progress, LDAP *ld, int msgID);

  /**
   ** Execute Method, runs outside the event loop.
   **/
  void Execute(const AsyncProgressWorker::ExecutionProgress &progress);

  /**
   ** HandleOkCallback method, gets called when the execute method finishes.
   ** Executes in event loop.
   **/
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // BINDINGS_LDAP_BIND_PROGRESS_H_