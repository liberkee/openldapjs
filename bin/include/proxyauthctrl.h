#ifndef _PROXYAUTHCTRL_H_
#define _PROXYAUTHCTRL_H_

LDAP_BEGIN_DECL
/*
 * in proxyauthctrl.c
 */
#define LDAP_CONTROL_PROXYAUTHENTICATION "2.16.840.1.113730.3.4.18"

LDAP_F( int )
ldap_create_proxyauth_control LDAP_P((
    LDAP        *ld,
    char        *authid,
    LDAPControl **ctrlp ));

LDAP_END_DECL
#endif
