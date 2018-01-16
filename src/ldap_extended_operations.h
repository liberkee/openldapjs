#ifndef LDAP_EXTENDED_OPERATIONS_H
#define LDAP_EXTENDED_OPERATIONS_H

#include <iostream>
#include <map>
#include <functional>
#include <ldap.h>
#include <nan.h>
class LdapExtendedOperations
{
  public:
    LdapExtendedOperations();
    struct berval* LdapExopCancel(const v8::Local<v8::Object>& objectData);
    std::map<std::string, std::function<struct berval* (const v8::Local<v8::Object> &)> > functionMap() const;

  private:
    std::map<std::string,
    std::function<struct berval*(const v8::Local<v8::Object> &)>> functionMap_{};
};

#endif // LDAP_EXTENDED_OPERATIONS_H
