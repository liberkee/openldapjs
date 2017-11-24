#ifndef _PSEARCHCTRL_H_
#define _PSEARCHCTRL_H_

LDAP_BEGIN_DECL
/*
 * in psearchctrl.c
 */
#define LDAP_CONTROL_PERSISTENTSEARCH   "2.16.840.1.113730.3.4.3"

#define LDAP_CHANGETYPE_ADD             1
#define LDAP_CHANGETYPE_DELETE          2
#define LDAP_CHANGETYPE_MODIFY          4
#define LDAP_CHANGETYPE_MODDN           8
#define LDAP_CHANGETYPE_ANY             (1|2|4|8)
LDAP_F( int )
ldap_create_persistentsearch_control LDAP_P((
    LDAP        *ld,
    int         changeTypes,
    int         changesOnly,
    int         returnEchgCtls,
    char        isCritical,
    LDAPControl **ctrlp ));

LDAP_F( int )
ldap_parse_entrychange_control LDAP_P((
    LDAP        *ld,
    LDAPControl **ctrls,
    int         *changeType,
    char        **prevDN,
    int         *hasChangeNum,
    long        *changeNum ));

LDAP_END_DECL

#endif
