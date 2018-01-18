#ifndef OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_
#define OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_

#include <ldap.h>
#include <nan.h>
#include <functional>
#include <map>
class ExpoConstructStructure {
 public:
  /**
   * @brief ExpoConstructStructure
   */
  ExpoConstructStructure();

  /**
   * @brief LdapExopCancel
   * @param objectData
   * @return
   */

  struct berval ExpoConstructStructure::LdapExopChangePassword(
      const v8::Local<v8::Object> &objectData);

  /**
   * @brief LdapExopCancel
   * @param objectData
   * @return
   */

  struct berval ExpoConstructStructure::LdapExopRefresh(
      const v8::Local<v8::Object> &objectData);

  /**
   * @brief LdapExopCancel
   * @param objectData
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

 private:
  BerElement *valueConstr{};
  struct berval valueBer {};
  std::map<std::string,
           std::function<struct berval(const v8::Local<v8::Object> &)>>
      functionMap_{};
};

#endif  // OPENLDAPJS_SRC_LDAP_EXTENDED_OPERATIONS_H_