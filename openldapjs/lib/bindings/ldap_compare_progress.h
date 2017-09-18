#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_COMPARE_PROGRESS_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_COMPARE_PROGRESS_H_

#include <ldap.h>
#include <nan.h>
#include <chrono>
#include <iostream>
#include <map>
#include <string>
#include <thread>
#include "ldap_control.h"

class LDAPCompareProgress : public Nan::AsyncProgressWorker {
 private:
  LDAP *ld;
  Nan::Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;

 public:
  LDAPCompareProgress(Nan::Callback *callback, Nan::Callback *progress,
                      LDAP *ld, int msgID);

  /**
   ** Execute Method, runs outside the event loop.
   **/
  void Execute(const Nan::AsyncProgressWorker::ExecutionProgress &progress);

  /**
   ** HandleOkCallback method, gets called when the execute method finishes.
   ** Executes in event loop.
   **/
  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_COMPARE_PROGRESS_H_
