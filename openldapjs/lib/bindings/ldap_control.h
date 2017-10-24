#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_CONTROL_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_CONTROL_H_

#include <lber.h>
#include <ldap.h>
#include <nan.h>
#include <memory>
#include <string>
#include <vector>
#include "ldap_map_result.h"

#define LBER_ALIGNED_BUFFER(uname, size) \
  union uname {                          \
    char buffer[size];                   \
    int ialign;                          \
    long lalign;                         \
    float falign;                        \
    double dalign;                       \
    char* palign;                        \
  }

#define LBER_ELEMENT_SIZEOF (256)
typedef LBER_ALIGNED_BUFFER(lber_berelement_u,
                            LBER_ELEMENT_SIZEOF) BerElementBuffer;

/**
 **@brief LdapControls class, create a control for request and print the
 **response result from server.
 **/
class LdapControls {
 private:
  std::shared_ptr<LDAPMapResult> mapResult_{};

 public:
  LdapControls();

  /**
   **@brief CreateModificationControls Method, create the postread, preread
   ** controls.
   **@param control_handle, The array of object for constructing the control
   **/
  std::vector<LDAPControl*> CreateModificationControls(
      const v8::Local<v8::Array>& control_handle);
  /**
  **@brief PrintModificationControls Method, return the controls from an
  *request.
  **@param ld, LDAP client structure to specific client
  **@param resultMsg, the message that is return from the ldap_result
  **/
  std::string PrintModificationControls(LDAP* ld, LDAPMessage* resultMsg);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_CONTROL_H_
