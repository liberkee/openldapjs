#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_MAP_RESULT_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_MAP_RESULT_H_

#include <lber.h>
#include <map>
#include <string>
#include <utility>
#include <vector>

class LDAPMapResult {
 public:
  std::vector<std::map<int, std::pair<std::string, std::string>>> LDIFMap;
  std::map<int, std::pair<std::string, std::string>> entry;
  std::pair<std::string, std::string> ldapEntry;
  unsigned int counterMap = 0;

 public:
  LDAPMapResult();

  void generateMapAttribute(char *attribute, char **values);
  void generateMapAttributeBer(char *attribute, BerVarray values);
  void generateMapEntryDn(char *dnEntry);
  std::string resultLDIFString();
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_MAP_RESULT_H_