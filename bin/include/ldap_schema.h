/* $OpenLDAP: pkg/ldap/include/ldap_schema.h,v 1.10.6.5 2000/07/29 01:53:06 kurt Exp $ */
/* $Novell: ldap_schema.h,v 1.6 2001/10/04 20:21:18 $ */
/*
 * Copyright 1999-2000 The OpenLDAP Foundation, Redwood City, California, USA
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms are permitted only
 * as authorized by the OpenLDAP Public License.  A copy of this
 * license is available at http://www.OpenLDAP.org/license.html or
 * in file LICENSE in the top-level directory of the distribution.
 ****************************************************************************
 * Copyright (c) 2006 Novell, Inc.
 * All Rights Reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; version 2.1 of the license.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, contact Novell, Inc.
 *
 * To contact Novell about this file by physical or electronic mail,
 * you may find current contact information at www.novell.com
 *
 ****************************************************************************
 */
/*
 * ldap-schema.h - Header for basic schema handling functions that can be
 *		used by both clients and servers.
 */

#ifndef _LDAP_SCHEMA_H
#define _LDAP_SCHEMA_H 1

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ldap_cdefs.h>
#include "ldap.h"

LDAP_BEGIN_DECL

void
ber_memvfree LDAP_P((
        void** vector ));


#define LBER_MALLOC                     malloc
#define LBER_CALLOC                     calloc
#define LBER_REALLOC       		realloc
#define LBER_FREE                       free
#define LBER_VFREE                      ber_memvfree
#define LBER_STRDUP                     strdup

#define LDAP_MALLOC(s)          (LBER_MALLOC((s)))
#define LDAP_CALLOC(n,s)        (LBER_CALLOC((n),(s)))
#define LDAP_REALLOC(p,s)       (LBER_REALLOC((p),(s)))
#define LDAP_FREE(p)            (LBER_FREE((p)))
#define LDAP_VFREE(v)           (LBER_VFREE((void **)(v)))
#define LDAP_STRDUP(s)          (LBER_STRDUP((s)))

#define LDAP_SPACE(c)   ((c) == ' ' || (c) == '\t' || (c) == '\n')
#define LDAP_DIGIT(c)  ( (c) >= '0' && (c) <= '9' )

void ber_memfree LDAP_P(( void* p ));

void ber_memvfree LDAP_P(( void** vector ));


#define LDAP_SCHEMA_ATTRIBUTE_TYPE      0
#define LDAP_SCHEMA_OBJECT_CLASS        1
#define LDAP_SCHEMA_SYNTAX              2
#define LDAP_SCHEMA_MATCHING_RULE       3
#define LDAP_SCHEMA_MATCHING_RULE_USE   4
#define LDAP_SCHEMA_NAME_FORM           5
#define LDAP_SCHEMA_DIT_CONTENT_RULE    6
#define LDAP_SCHEMA_DIT_STRUCTURE_RULE  7

#define     LDAP_SCHEMA_OID             "OID"
#define     LDAP_SCHEMA_DESCRIPTION     "DESC"
/*     All but LDAPSchemaSyntax  */
#define     LDAP_SCHEMA_NAMES           "NAME"
/*#define    LDAP_SCHEMA_VALUE                                */
#define     LDAP_SCHEMA_OBSOLETE        "OBSOLETE"

/*     LDAPSchemaAttributeType   */
#define     LDAP_SCHEMA_SUPERIOR        "SUP"
#define     LDAP_SCHEMA_EQUALITY        "EQUALITY"
#define     LDAP_SCHEMA_ORDERING        "ORDERING"
#define     LDAP_SCHEMA_SUBSTRING       "SUBSTR"
#define     LDAP_SCHEMA_SYNTAX_OID      "SYNTAX"
#define     LDAP_SCHEMA_SINGLE_VALUED   "SINGLE-VALUE"
#define     LDAP_SCHEMA_COLLECTIVE      "COLLECTIVE"
#define     LDAP_SCHEMA_NO_USER_MOD     "NO-USER-MODIFICATION"
#define     LDAP_SCHEMA_USAGE           "USAGE"

/*     LDAPSchemaObjectClass                                */
#define     LDAP_SCHEMA_SUPERIORS       "SUP"
#define     LDAP_SCHEMA_MUST_ATTRIBUTES "MUST"
#define     LDAP_SCHEMA_MAY_ATTRIBUTES  "MAY"
#define     LDAP_SCHEMA_TYPE_ABSTRACT   "ABSTRACT"
#define     LDAP_SCHEMA_TYPE_STRUCTURAL "STRUCTURAL"
#define     LDAP_SCHEMA_TYPE_AUXILIARY  "AUXILIARY"

/*     LDAPSchemaMatchingRule                               */
#define     LDAP_SCHEMA_SYNTAX_OID      "SYNTAX"

/*     LDAPSchemaMatchingRuleUse                            */
#define     LDAP_SCHEMA_APPLIES         "APPLIES"

/*     LDAPSchemaNameForm                                   */
#define     LDAP_SCHEMA_NAME_FORM_OBJECT   "OC"

/*     LDAPSchemaDITContentRule                             */
#define     LDAP_SCHEMA_AUX_CLASSES     "AUX"
#define     LDAP_SCHEMA_NOT_ATTRIBUTES  "NOT"

/*     LDAPSchemaDITStructureRule : Does not contain OID    */
#define     LDAP_SCHEMA_RULE_ID         "RULEID"
#define     LDAP_SCHEMA_NAME_FORM_OID   "FORM"

#define LDAP_SCHEMA_USER_APP         "userApplications"
#define LDAP_SCHEMA_DIRECTORY_OP     "directoryOperation"
#define LDAP_SCHEMA_DISTRIBUTED_OP   "distributedOperation"
#define LDAP_SCHEMA_DSA_OP           "dSAOperation"




typedef struct ldap_schema LDAPSchema;
typedef struct ldap_schema_element LDAPSchemaElement;


struct ldap_schema_element {
	int type;
        union {
	       struct ldap_syntax           *syntax;
	       struct ldap_attributetype    *attribute;
	       struct ldap_objectclass      *object;
	       struct ldap_matchingrule     *matching;
	       struct ldap_matchingruleuse  *matchinguse;
	       struct ldap_nameform         *nameform;
	       struct ldap_ditcontentrule   *ditcontent;
	       struct ldap_ditstructurerule *ditstructure;
	} element;
};

struct ldap_schema{

	int testInit;
	
	struct ldap_schema_element **oids[8];
	
	int oidsAllocated[8];
	
	int oidCount[8];
	
	struct ldap_schema_named_element *names[8];
	
	int namesAllocated[8];
	
	int nameCount[8];
	
	LDAPMod **changes;
	
	int changesCount;
	
	int changesAllocated;

};

typedef struct ldap_schema_mod {
             int op;                 
             char *fieldName;        
             char **values;        

} LDAPSchemaMod;



/* Codes for parsing errors */

#define LDAP_SCHERR_OUTOFMEM		1
#define LDAP_SCHERR_UNEXPTOKEN		2
#define LDAP_SCHERR_NOLEFTPAREN		3
#define LDAP_SCHERR_NORIGHTPAREN	4
#define LDAP_SCHERR_NODIGIT		5
#define LDAP_SCHERR_BADNAME		6
#define LDAP_SCHERR_BADDESC		7
#define LDAP_SCHERR_BADSUP		8
#define LDAP_SCHERR_DUPOPT		9
#define LDAP_SCHERR_EMPTY		10

/* String definitions for RFC2252 names */
#define ATTRIBUTE_TYPES     "attributeTypes"
#define OBJECT_CLASSES      "objectClasses"
#define LDAP_SYNTAXES       "ldapSyntaxes"
#define MATCHING_RULES      "matchingRules"
#define MATCHING_RULE_USE   "matchingRuleUse"
#define NAME_FORMS          "nameForms"
#define DIT_CONTENT_RULES   "dITContentRules"
#define DIT_STRUCTURE_RULES "dITStructureRules"


typedef struct ldap_schema_extension_item {
	char *lsei_name;
	char **lsei_values;
} LDAPSchemaExtensionItem;

typedef struct ldap_syntax {
	char *syn_oid;		/* REQUIRED */
	char **syn_names;	/* OPTIONAL */
	char *syn_desc;		/* OPTIONAL */
	LDAPSchemaExtensionItem **syn_extensions; /* OPTIONAL */
} LDAPSyntax;

typedef struct ldap_matchingrule {
	char *mr_oid;		/* REQUIRED */
	char **mr_names;	/* OPTIONAL */
	char *mr_desc;		/* OPTIONAL */
	int  mr_obsolete;	/* OPTIONAL */
	char *mr_syntax_oid;	/* REQUIRED */
	LDAPSchemaExtensionItem **mr_extensions; /* OPTIONAL */
} LDAPMatchingRule;

typedef struct ldap_attributetype {
	char *at_oid;		/* REQUIRED */
	char **at_names;	/* OPTIONAL */
	char *at_desc;		/* OPTIONAL */
	int  at_obsolete;	/* 0=no, 1=yes */
	char *at_sup_oid;	/* OPTIONAL */
	char *at_equality_oid;	/* OPTIONAL */
	char *at_ordering_oid;	/* OPTIONAL */
	char *at_substr_oid;	/* OPTIONAL */
	char *at_syntax_oid;	/* OPTIONAL */
	int  at_syntax_len;	/* OPTIONAL */
	int  at_single_value;	/* 0=no, 1=yes */
	int  at_collective;	/* 0=no, 1=yes */
	int  at_no_user_mod;	/* 0=no, 1=yes */
	int  at_usage;		/* 0=userApplications, 1=directoryOperation,
				   2=distributedOperation, 3=dSAOperation */
	LDAPSchemaExtensionItem **at_extensions; /* OPTIONAL */
} LDAPAttributeType;

typedef struct ldap_objectclass {
	char *oc_oid;		/* REQUIRED */
	char **oc_names;	/* OPTIONAL */
	char *oc_desc;		/* OPTIONAL */
	int  oc_obsolete;	/* 0=no, 1=yes */
	char **oc_sup_oids;	/* OPTIONAL */
	int  oc_kind;		/* 0=ABSTRACT, 1=STRUCTURAL, 2=AUXILIARY */
	char **oc_at_oids_must;	/* OPTIONAL */
	char **oc_at_oids_may;	/* OPTIONAL */
	LDAPSchemaExtensionItem **oc_extensions; /* OPTIONAL */
} LDAPObjectClass;

typedef struct ldap_matchingruleuse {
	char *mru_oid;		    /* REQUIRED */
	char **mru_names;	    /* OPTIONAL */
	char *mru_desc;	        /* OPTIONAL */
	int  mru_obsolete;	    /* 0=no, 1=yes */
    char **mru_at_applies;  /* REQUIRED */
    LDAPSchemaExtensionItem **mru_extensions; /* OPTIONAL */
} LDAPMatchingRuleUse;

typedef struct ldap_nameform {
	char *nf_oid;		    /* REQUIRED */
	char **nf_names;	    /* OPTIONAL */
	char *nf_desc;	        /* OPTIONAL */
	int  nf_obsolete;	    /* 0=no, 1=yes */
    char *nf_oc_oid;        /* REQUIRED */
    char **nf_at_oids_must; /* REQUIRED */
    char **nf_at_oids_may;  /* OPTIONAL */
    LDAPSchemaExtensionItem **nf_extensions; /* OPTIONAL */
} LDAPNameForm;

typedef struct ldap_ditcontentrule {
	char *cr_oid;		    /* REQUIRED */
	char **cr_names;	    /* OPTIONAL */
	char *cr_desc;	        /* OPTIONAL */
	int  cr_obsolete;	    /* 0=no, 1=yes */
    char **cr_oids_aux;     /* OPTIONAL */
    char **cr_oids_must;    /* OPTIONAL */
    char **cr_oids_may;     /* OPTIONAL */
    char **cr_oids_not;     /* OPTIONAL */
	LDAPSchemaExtensionItem **cr_extensions; /* OPTIONAL */
} LDAPDITContentRule;

typedef struct ldap_ditstructurerule {
    char *sr_rule_id;       /* REQUIRED */
	char **sr_names;	    /* OPTIONAL */
	char *sr_desc;	        /* OPTIONAL */
	int  sr_obsolete;	    /* 0=no, 1=yes */
    char *sr_nf_oid;        /* OPTIONAL */
    char **sr_sup_ids;      /* OPTIONAL */
	LDAPSchemaExtensionItem **sr_extensions; /* OPTIONAL */
} LDAPDITStructureRule;

#define LDAP_SCHEMA_NO				0
#define LDAP_SCHEMA_YES				1

#define LDAP_SCHEMA_USER_APPLICATIONS		0
#define LDAP_SCHEMA_DIRECTORY_OPERATION		1
#define LDAP_SCHEMA_DISTRIBUTED_OPERATION	2
#define LDAP_SCHEMA_DSA_OPERATION		3

#define LDAP_SCHEMA_ABSTRACT			0
#define LDAP_SCHEMA_STRUCTURAL			1
#define LDAP_SCHEMA_AUXILIARY			2

/*
 * Flags that control how liberal the parsing routines are.
 */
#define LDAP_SCHEMA_ALLOW_NONE		0x00 /* Strict parsing               */
#define LDAP_SCHEMA_ALLOW_NO_OID	0x01 /* Allow missing oid            */
#define LDAP_SCHEMA_ALLOW_QUOTED	0x02 /* Allow bogus extra quotes     */
#define LDAP_SCHEMA_ALLOW_DESCR		0x04 /* Allow descr instead of OID   */
#define LDAP_SCHEMA_ALLOW_DESCR_PREFIX	0x08 /* Allow descr as OID prefix    */
#define LDAP_SCHEMA_ALLOW_ALL		0x0f /* Be very liberal in parsing   */

LDAP_F( LDAP_CONST char * )
ldap_syntax2name LDAP_P((
	LDAPSyntax * syn ));

LDAP_F( LDAP_CONST char * )
ldap_matchingrule2name LDAP_P((
	LDAPMatchingRule * mr ));

LDAP_F( LDAP_CONST char * )
ldap_attributetype2name LDAP_P((
	LDAPAttributeType * at ));

LDAP_F( LDAP_CONST char * )
ldap_objectclass2name LDAP_P((
	LDAPObjectClass * oc ));

/* free functions: */

LDAP_F( void )
ldap_syntax_free LDAP_P((
	LDAPSyntax * syn ));

LDAP_F( void )
ldap_matchingrule_free LDAP_P((
	LDAPMatchingRule * mr ));

LDAP_F( void )
ldap_attributetype_free LDAP_P((
	LDAPAttributeType * at ));

LDAP_F( void )
ldap_objectclass_free LDAP_P((
	LDAPObjectClass * oc ));

LDAP_F( void )
ldap_matchingrule_free LDAP_P((
	LDAPMatchingRule * mr ));

LDAP_F( void )
ldap_matchingruleuse_free LDAP_P((
	LDAPMatchingRuleUse * mru ));

LDAP_F( void )
ldap_nameform_free LDAP_P((
	LDAPNameForm * nf ));

LDAP_F( void )
ldap_ditcontentrule_free LDAP_P((
	LDAPDITContentRule * cr ));

LDAP_F( void )
ldap_ditstructurerule_free LDAP_P((
	LDAPDITStructureRule * sr ));

/* parsing functions: (Constructors) */

LDAP_F( LDAPObjectClass * )
ldap_str2objectclass LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

LDAP_F( LDAPAttributeType * )
ldap_str2attributetype LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

LDAP_F( LDAPSyntax * )
ldap_str2syntax LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

LDAP_F( LDAPMatchingRule * )
ldap_str2matchingrule LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

LDAP_F( LDAPMatchingRuleUse * )
ldap_str2matchingruleuse LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

LDAP_F( LDAPNameForm * )
ldap_str2nameform LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

LDAP_F( LDAPDITContentRule * )
ldap_str2ditcontentrule LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

LDAP_F( LDAPDITStructureRule * )
ldap_str2ditstructurerule LDAP_P((
	LDAP_CONST char * s,
	int * code,
	LDAP_CONST char ** errp,
	LDAP_CONST int flags ));

/* to string functions: */

LDAP_F( char * )
ldap_objectclass2str LDAP_P((
	LDAP_CONST LDAPObjectClass * oc ));

LDAP_F( char * )
ldap_attributetype2str LDAP_P((
	LDAP_CONST LDAPAttributeType * at ));

LDAP_F( char * )
ldap_syntax2str LDAP_P((
	LDAP_CONST LDAPSyntax * syn ));

LDAP_F( char * )
ldap_matchingrule2str LDAP_P((
	LDAP_CONST LDAPMatchingRule * mr ));

LDAP_F( char * )
ldap_matchingruleuse2str LDAP_P((
	LDAP_CONST LDAPMatchingRuleUse * mru ));

LDAP_F( char * )
ldap_nameform2str LDAP_P((
	LDAP_CONST LDAPNameForm * nf ));

LDAP_F( char * )
ldap_ditcontentrule2str LDAP_P((
	LDAP_CONST LDAPDITContentRule * cr ));

LDAP_F( char * )
ldap_ditstructurerule2str LDAP_P((
	LDAP_CONST LDAPDITStructureRule * sr  ));

LDAP_F( char * )
ldap_scherr2str LDAP_P((
	int code )) LDAP_GCCATTR((const));

LDAP_END_DECL

#endif

