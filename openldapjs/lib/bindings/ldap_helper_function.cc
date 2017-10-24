#include "ldap_helper_function.h"
#include "constants.h"

std::string buildsSearchMessage(LDAP *ld, LDAPMessage *result) {
  std::string pageResult;
  BerElement *ber{};
  LDAPMessage *entry{};
  char *dn{};
  char *attribute{};
  char **values{};
  for (entry = ldap_first_entry(ld, result); entry != nullptr;
       entry = ldap_next_entry(ld, entry)) {
    dn = ldap_get_dn(ld, entry);
    pageResult += constants::newLine;
    pageResult += constants::dn;
    pageResult += constants::separator;
    pageResult += dn;
    pageResult += constants::newLine;
    ldap_memfree(dn);
    for (attribute = ldap_first_attribute(ld, entry, &ber);
         attribute != nullptr;
         attribute = ldap_next_attribute(ld, entry, ber)) {
      if ((values = ldap_get_values(ld, entry, attribute)) != nullptr) {
        for (auto i = 0; values[i] != nullptr; i++) {
          pageResult += attribute;
          pageResult += constants::separator;
          pageResult += values[i];
          pageResult += constants::newLine;
        }
        ldap_value_free(values);
      }
      ldap_memfree(attribute);
    }
    ber_free(ber, 0);
  }
  ldap_msgfree(result);

  return pageResult;
}
