#ifndef OPENLDAPJS_SRC_LDAP_HELPER_FUNCTION_H_
#define OPENLDAPJS_SRC_LDAP_HELPER_FUNCTION_H_

#include <ldap.h>
#include <string>

  /**
  **@brief buildsSearchMessage create the search response
  **@param ld, LDAP structure that holds ldap internal data.
  **@param result, structure of the results
  **@return Return a LDIF formatted string 
  **/

std::string buildsSearchMessage(LDAP *ld, LDAPMessage *result);

#endif  // OPENLDAPJS_SRC_LDAP_HELPER_FUNCTION_H_
