#ifndef LDAP_CONTROL_H
#define LDAP_CONTROL_H
#include <iostream>
#include <vector>
#include <ldap.h>
#include <nan.h>
#include <lber.h>

#define LBER_ALIGNED_BUFFER(uname, size) \
        union uname { \
          char buffer[size]; \
          int ialign; \
          long lalign; \
          float falign; \
          double dalign; \
          char* palign; \
        }

#define LBER_ELEMENT_SIZEOF (256)
typedef LBER_ALIGNED_BUFFER(lber_berelement_u, LBER_ELEMENT_SIZEOF)
        BerElementBuffer;

class LdapControls
{
  public:
    LdapControls();

    std::vector<LDAPControl*> CreateControls(const v8::Local<v8::Array>& control_handle);
    std::string PrintControls(LDAP *ld, LDAPMessage *resultMsg);
};

#endif // LDAP_CONTROLs_H
