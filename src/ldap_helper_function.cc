#include "ldap_helper_function.h"
#include "constants.h"
#include "ldap_map_result.h"
#include <memory>

std::string buildsSearchMessage(LDAP *ld, LDAPMessage *result) {
  std::shared_ptr<LDAPMapResult> mapResult_ = std::make_shared<LDAPMapResult>();
  std::string pageResult;
  BerElement *ber{};
  LDAPMessage *entry{};
  char *dn{};
  char *attribute{};
  char **values{};
  for (entry = ldap_first_entry(ld, result); entry != nullptr;
       entry = ldap_next_entry(ld, entry)) {
    dn = ldap_get_dn(ld, entry);
    mapResult_->GenerateMapEntryDn(dn);
    ldap_memfree(dn);
    for (attribute = ldap_first_attribute(ld, entry, &ber);
         attribute != nullptr;
         attribute = ldap_next_attribute(ld, entry, ber)) {
      if ((values = ldap_get_values(ld, entry, attribute)) != nullptr) {
        mapResult_->GenerateMapAttribute(attribute, values);
        ldap_value_free(values);
      }
      ldap_memfree(attribute);
    }
    mapResult_->FillLdifList(mapResult_->GetEntry());
    mapResult_->ClearEntry();
    ber_free(ber, 0);
  }
  ldap_msgfree(result);

  return mapResult_->ResultLDIFString();
}
