#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_MAP_RESULT_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_MAP_RESULT_H_

#include <lber.h>
#include <map>
#include <string>
#include <utility>
#include <vector>

/**
 **@brief LDAPMapResult class, Interrogate the result message from LDAP and set
 ** it into a vector of map
 **/
class LDAPMapResult {
 private:
  std::vector<std::map<int, std::pair<std::string, std::string>>> LDIFList_;
  std::map<int, std::pair<std::string, std::string>> entry_;
  unsigned int counterMap_{};

 public:
  LDAPMapResult();

  /**
  **@brief GenerateMapAttribute Method, generate the map for search response
  **@param attribute, Parameter for attribute from an entry
  **@param values, Parameter for values from an attribute
  **/
  void GenerateMapAttribute(const std::string attribute, char **values);
  /**
  **@brief GenerateMapAttribute Method, generate the map for control response
  **@param attribute, Parameter for attribute from an entry
  **@param vals, Parameter for values from an attribute as berval structure
  **/
  void GenerateMapAttributeBer(const std::string attribute, BerVarray vals);
  /**
  **@brief GenerateMapEntryDn Method, takes the DN from the entry.
  **@param dnEntry, The entryDN from response
  **/
  void GenerateMapEntryDn(const std::string dnEntry);
  /**
  **@brief FillLdifList Method, takes a map entry and push it to an vector of
  **map.
  **@param entry, map parameter that is pushed to the vector
  **/
  void FillLdifList(
      const std::map<int, std::pair<std::string, std::string>> &entry);
  /**
  **@brief ClearEntry Method, cleans up the map
  **/
  void ClearEntry();
  /**
  **@brief GetEntry Method, Get the map for a single entry
  **@return the map for an ldap entry
  **/
  std::map<int, std::pair<std::string, std::string>> GetEntry();
  /**
  **@brief ResultLDIFString Method, Interrogate the map vector
  **@return a string from the map structure
  **/
  std::string ResultLDIFString();
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_MAP_RESULT_H_