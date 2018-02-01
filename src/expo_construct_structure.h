#ifndef OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_
#define OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_

#include <ldap.h>
#include <nan.h>
#include <functional>
#include <map>

class ExpoConstructStructure {
 private:
  BerElement *valueConstr_{};
  struct berval valueBer_{};
  /**
   * @brief functionMap_
   * @return
   */
  std::map<std::string,
           std::function<struct berval(const v8::Local<v8::Object> &)>>
      functionMap_{};

 public:
  /**
   * @brief Constructor
   */
  ExpoConstructStructure();

  /**
   * @brief LdapExopChangePassword Method, return the berval structure for
   * change password operation
   * @param objectData The value send it from nodejs for the operation
   * @return
   */

  struct berval LdapExopChangePassword(const v8::Local<v8::Object> &objectData);

  /**
   * @brief LdapExopRefresh Method, return the berval structure for refresh
   * operation
   * @param objectData The value send it from nodejs for the operation
   * @return
   */

  struct berval LdapExopRefresh(const v8::Local<v8::Object> &objectData);

  /**
   * @brief LdapExopCancel Method, return the berval structure for cancel
   * operation
   * @param objectData The value send it from nodejs for the operation
   * @return
   */
  struct berval LdapExopCancel(const v8::Local<v8::Object> &objectData);

  /**
   * @brief functionMap
   * @return
   */
  std::map<std::string,
           std::function<struct berval(const v8::Local<v8::Object> &)>>
  functionMap() const;
};

#endif  // OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_