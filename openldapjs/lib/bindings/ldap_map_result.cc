#include "ldap_map_result.h"
#include <iostream>
#include "constants.h"

LDAPMapResult::LDAPMapResult() {}

void LDAPMapResult::generateMapEntryDn(char *dnEntry) {
  if (!LDAPMapResult::entry.empty()) {
    LDIFMap.push_back(LDAPMapResult::entry);
    LDAPMapResult::entry.clear();
  }
  ldapEntry.first = constants::dn;
  ldapEntry.second = dnEntry;
  entry[counterMap++] = ldapEntry;
}

void LDAPMapResult::generateMapAttribute(char *attribute, char **values) {
  for (int i = 0; values[i] != nullptr; i++) {
    ldapEntry.first = attribute;
    ldapEntry.second = values[i];
    entry[counterMap++] = ldapEntry;
  }
}

void LDAPMapResult::generateMapAttributeBer(char *attribute, BerVarray vals) {
  for (int i = 0; vals[i].bv_val != nullptr; i++) {
    ldapEntry.first = attribute;
    ldapEntry.second = vals[i].bv_val;
    entry[counterMap++] = ldapEntry;
  }
}

std::string LDAPMapResult::resultLDIFString() {
  std::string resultLDIF{};
  for (auto &vector : LDAPMapResult::LDIFMap) {
    for (auto &map : vector) {
      resultLDIF += constants::newLine;
      resultLDIF += map.second.first;
      resultLDIF += constants::separator;
      resultLDIF += map.second.second;
    }
    resultLDIF += constants::newLine;
  }
  return resultLDIF;
}
