#ifndef OPENLDAPJS_LIB_BINDINGS_LDAP_CONTROL_H_
#define OPENLDAPJS_LIB_BINDINGS_LDAP_CONTROL_H_

#include <lber.h>
#include <ldap.h>
#include <nan.h>
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

class LdapControls {
 private:
  LDAPMapResult* mapResult = new LDAPMapResult();

 public:
  LdapControls();

  std::vector<LDAPControl*> CreateModificationControls(
      const v8::Local<v8::Array>& control_handle);
  std::string PrintModificationControls(LDAP* ld, LDAPMessage* resultMsg);
};

#endif  // OPENLDAPJS_LIB_BINDINGS_LDAP_CONTROL_H_
