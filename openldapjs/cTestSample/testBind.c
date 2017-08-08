
#include <ldap.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/select.h>

int main(int argc, char **argv)
{
    int i = 0;
    mrst

        while (i < 1000)
    {
        LDAP *ld;
        LDAPMessage *result, *e;
        char hostAddress[] = "ldap://localhost:389";
        int version;
        char deletedDN[] = "cn=newPointChildBLABLA1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com";
        char *dn;
        int state = ldap_initialize(&ld, hostAddress);

        if (state != LDAP_SUCCESS || ld == NULL)
        {

            return (-1);
        }

        /* Use the LDAP_OPT_PROTOCOL_VERSION session preference to specify

that the client is an LDAPv3 client. */

        version = LDAP_VERSION3;

        ldap_set_option(ld, LDAP_OPT_PROTOCOL_VERSION, &version);

        int tlsState = ldap_start_tls_s(ld, NULL, NULL);

        /* STEP 2: Bind to the server.

In this example, the client binds anonymously to the server

(no DN or credentials are specified). */

        int rc = ldap_simple_bind(ld, "cn=admin,dc=demoApp,dc=com", "secret");
        int bindResult = 0;
        struct timeval timeOut = {0, 1};

        while (bindResult == 0)
        {

            bindResult = ldap_result(ld, rc, 1, &timeOut, &result);
        }

        if (bindResult == -1)
        {
            printf("bind failed\n");
            return -1;
        }
        else
        {
            int status = ldap_result2error(ld, result, 0);
            if (status != LDAP_SUCCESS)
            {
                printf("binding failed with error :");
                return -1;
            }
            else
            {
                //cout<<"binding success"<<endl;
            }
        }
        ldap_msgfree(result);

        int message;
        int searchResult = ldap_search_ext(ld,
                                           "cn=admin,dc=demoApp,dc=com",
                                           2,
                                           "objectClass=inetOrgPerson" NULL,
                                           0,
                                           NULL,
                                           NULL,
                                           &timeout,
                                           LDAP_NO_LIMIT,
                                           &message);

        if (searchResult != LDAP_SUCCESS)
        {
            printf("Search failed");
            return -1;
        }

        int ldapResult;
        int searchFinished = 0;
        int msgID;
        LDAPMessage *resultMsg;
        while (searchFinished == 0)
        {
            ldapResult = ldap_result(ld, msgID, LDAP_MSG_ONE, &timeout, &resultMsg);

            switch (ldapResult)
            {
            case -1:
                ldapResult = ldap_get_lderrno(ld, NULL, NULL);
                fprintf(stderr, "ldap_result:%s\n", ldap_err2string(rc));
                ldap_unbind(ld);
                return 1;

            case 0:
                break;

            case LDAP_RES_SEARCH_ENTRY:
                if ((dn = ldap_get_dn(ld, resultMsg)) != NULL)
                {
                    //do something with dn
                    ldap_memfree(dn);
   
                }
            }
        }

        int unbindResult = ldap_unbind(ld);

        if (unbindResult != LDAP_SUCCESS)
        {
            printf("unbind failed with err:");
        }

        i++;
    }

    return 0;
}