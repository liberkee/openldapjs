#ifndef BINDINGS_LDAP_PAGED_SEARCH_PROGRESS_H_
#define BINDINGS_LDAP_PAGED_SEARCH_PROGRESS_H_

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

class LDAPPagedSearchProgress : public AsyncProgressWorker {
 private:
  std::shared_ptr<std::map<std::string, berval *>> cookies{};
  LDAP *ld;
  Callback *progress;
  int result = 0;
  LDAPMessage *resultMsg;
  int msgID;
  std::string base;
  std::string filter;
  int scope;
  int pageSize;
  std::string pageResult;
  int status = 0;
  bool morePages = false;
  std::string cookieID;

 public:
  LDAPPagedSearchProgress(
      Callback *callback, Callback *progress, LDAP *ld, std::string base,
      int scope, std::string filter, const std::string &cookieID, int pgSize,
      const std::shared_ptr<std::map<std::string, berval *>> &cookies);

  // Executes in worker thread
  void Execute(const AsyncProgressWorker::ExecutionProgress &progress);

  // Executes in event loop

  void HandleOKCallback();

  void HandleProgressCallback(const char *data, size_t size);
};

#endif  // BINDINGS_LDAP_PAGED_SEARCH_PROGRESS_H_