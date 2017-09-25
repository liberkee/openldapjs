#include <ldap.h>
#include <map>
#include <string>
#include <vector>

namespace ldif_formatting {

std::vector<std::map<std::string, std::string>> getLdif(
    LDAP *ld, LDAPMessage **resultMsg) {
  BerElement *ber{};
  LDAPMessage *l_entry{};
  char *attribute{};
  char **values{};
  char *l_dn{};
  std::map<std::string, std::string> ldifEntry{};
  std::vector<std::map<std::string, std::string>> ldifEntryList{};
  std::string key = "dn";
  std::string value{};

  for (l_entry = ldap_first_entry(ld, resultMsg); l_entry != nullptr;
       l_entry = ldap_next_entry(ld, l_entry)) {
    value = ldap_get_dn(ld, l_entry);
    ldifEntry.insert(std::pair(key, value));

    value.reset();

    for (attribute = ldap_first_attribute(ld, l_entry, &ber);
         attribute != nullptr;
         attribute = ldap_next_attribute(ld, l_entry, ber)) {
      if ((values = ldap_get_values(ld, l_entry, attribute)) != nullptr) {
        for (int i = 0; values[i] != nullptr; i++) {
          /*
        resultSearch_ += attribute;
        resultSearch_ += ":";
        resultSearch_ += values[i];
        resultSearch_ += "\n";*/
          ldifEntry.insert(std::pair(attribute, values[i]);)
        }
        ldap_value_free(values);
      }
      ldap_memfree(attribute);
    }
    ber_free(ber, 0);
    resultSearch_ += "\n";
  }
}
}  // namespace ldif_formatting
