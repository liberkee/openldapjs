/* $Novell: connpool.h,v 1.3 2002/10/21 18:33:40 $ */
/*************************************************************************

   Copyright 2002 Novell, Inc.  All Rights Reserved.

   With respect to this file, Novell hereby grants to Developer a 
   royalty-free, non-exclusive license to include this sample code 
   and derivative binaries in its product. Novell grants to Developer 
   worldwide distribution rights to market, distribute or sell this 
   sample code file and derivative binaries as a component of 
   Developer's product(s).  Novell shall have no obligations to 
   Developer or Developer's customers with respect to this code.

   DISCLAIMER:

   Novell disclaims and excludes any and all express, implied, and 
   statutory warranties, including, without limitation, warranties 
   of good title, warranties against infringement, and the implied 
   warranties of merchantability and fitness for a particular purpose.  
   Novell does not warrant that the software will satisfy customer's 
   requirements or that the licensed works are without defect or error 
   or that the operation of the software will be uninterrupted.  
   Novell makes no warranties respecting any technical services or 
   support tools provided under the agreement, and disclaims all other 
   warranties, including the implied warranties of merchantability and 
   fitness for a particular purpose.

***************************************************************************
connpool.h - Header file for connection pool sample implementation.
             See connpool.c for full documentation.
***************************************************************************/
#ifndef _CONNPOOL_H
#define _CONNPOOL_H

#include <ldap.h>

/* Platform-dependent Mutex type definition */
#if defined WIN32
 #include <windows.h>                       /* All Win-32 platforms */
 typedef HANDLE CP_Mutex;

#elif defined N_PLAT_NLM && defined LIBC
 #include <nks/synch.h>                     /* NetWare/LIBC */
 typedef NXMutex_t* CP_Mutex;

#elif defined N_PLAT_NLM
  typedef long CP_Mutex;                    /* NetWare/CLIB */

#elif defined MODESTO
 #include <nksapi.h>                        /* Modesto */
 typedef NXMutex_t* CP_Mutex;

#elif defined UNIX
 #include <pthread.h>                       /* LINUX/Solaris/AIX */
 typedef pthread_mutex_t* CP_Mutex;

/* Single-threaded apps don't need mutex functions. Can use stubs. */
#else
/* Remove the following #error line to use empty stubs for mutex calls. */
#error  Unknown platform.\n  Define WIN32, N_PLAT_NLM, UNIX, or MODESTO compile symbol
 typedef int CP_Mutex;                       /* Unknown platform */
#endif

/* Platform-independent mutex functions */
int CP_mutex_init   (CP_Mutex *mutex);
int CP_mutex_lock   (CP_Mutex *mutex);
int CP_mutex_unlock (CP_Mutex *mutex);
int CP_mutex_destroy(CP_Mutex *mutex);


/* Defines */

#define CPOOL_UNBOUND  0
#define CPOOL_READY    1
#define CPOOL_INUSE    2

#define CPOOL_VALID   0x506F6F6C    /* Magic cookie "Pool" */

typedef int (BIND_CALLBACK)(char *host, int port, char *loginDN, 
                            char *password, LDAP **ld);


/* Data structures */

typedef struct ldaphostpool
{
    int disabled;        /* Non-zero means entire hostPool is disabled      */
    char *host;          /* The host for this array of handles              */
    int port;            /* Port number to use if not supplied with host    */
    char *loginDN;       /* DN to use for binding                           */
    char *password;      /* Password to use for binding                     */
    BIND_CALLBACK  *bindCallback;   /* Address of bind callback function    */
    int unbound;         /* # of handles in the unbound state               */
    int ready;           /* # of handles in the ready state                 */
    int inuse;           /* # of handles in use                             */
    LDAP **ld;           /* array of 'maxConns' LDAP session handles        */
    int *status;         /* array of 'maxConns' status values               */
} LDAPHostPool;


typedef struct ldapconnectionpool
{
    long valid;          /* Cookie indicating valid connection pool: "Pool" */
    int maxConns;        /* Max # of connections per host.                  */
    int minConns;        /* Initial # of bound connections per host         */
    int numhosts;        /* Number of hostPools in the pool                 */
    CP_Mutex mutex;      /* Mutex controlling access to this pool           */
    LDAPHostPool **hp;   /* Array of pointers to LDAPHostPool structs       */
} LDAPConnectionPool;


/* Function prototypes */

int cpoolCreate (
    int  minConns,                /* Initial # of connections per host     */
    int  maxConns,                /* Maximum # of connections per host     */
    char *host,                   /* Host name                             */
    int  port,                    /* Port number                           */
    char *loginDN,                /* DN to use for binding                 */
    char *password,               /* Password to use for binding           */
    BIND_CALLBACK  *bindCallback, /* Callback function for binding         */
    LDAPConnectionPool **pool     /* (out) Returned handle to pool         */
);  

int cpoolAddHost (
   LDAPConnectionPool *pool,      /* Pool handle                           */
   char *host,                    /* Host name                             */
   int  port,                     /* Port number                           */
   char *loginDN,                 /* DN to use for binding                 */
   char *password,                /* Password to use for binding           */
   BIND_CALLBACK  *bindCallback   /* Callback function for binding         */
);

int cpoolRemoveHost (
   LDAPConnectionPool *pool,      /* Pool handle                           */
   LDAPHostPool *hostPool         /* Ptr to LDAPHostPool struct to remove */
);

int cpoolGetConnection (
    LDAPConnectionPool *pool,     /* Pool handle */
    LDAP **pld                    /* (out)  LDAP session handle */
);

int cpoolReturnConnection (
    LDAPConnectionPool *pool,     /* Pool handle */
    LDAP *ld                      /* LDAP session handle being returned */
);

int cpoolResetBadConnection (
    LDAPConnectionPool *pool,     /* Pool handle */
    LDAP *ld                      /* Bad LDAP session handle being returned */
);

int cpoolGetHost (
    LDAPConnectionPool *pool,     /* Pool handle */
    LDAP *ld,                     /* LD handle to look for */
    LDAPHostPool **hostPool,      /* (out) Returned handle to hostPool struct */
    char **hostname               /* (out) Returned pointer to host name. */
);

int cpoolEnableHost (
    LDAPConnectionPool *pool,      /* Pool handle */
    LDAPHostPool *hp               /* HostPool handle */
);

int cpoolDisableHost (
    LDAPConnectionPool *pool,      /* Pool handle */
    LDAPHostPool *hp               /* HostPool handle */
);

void cpoolDestroy (
    LDAPConnectionPool *pool      /* Pool handle */
);


#endif
