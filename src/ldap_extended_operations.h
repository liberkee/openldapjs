#ifndef OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_
#define OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_

#include <iostream>
#include <map>
#include <functional>
#include <ldap.h>
#include <nan.h>
class LdapExtendedOperations {
  public:
    /**
     * @brief LdapExtendedOperations
     */
    LdapExtendedOperations();

    /**
     * @brief LdapExopCancel
     * @param objectData
     * @return
     */
    struct berval* LdapExopCancel(const v8::Local<v8::Object>& objectData);

    /**
     * @brief functionMap
     * @return
     */
    std::map<std::string, std::function<struct berval* (const v8::Local<v8::Object> &)> > functionMap() const;

  private:
    std::map<std::string,
    std::function<struct berval*(const v8::Local<v8::Object> &)>> functionMap_{};
};

#endif // OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_
