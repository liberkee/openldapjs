
#include <ldap.h>
#include <lber.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/select.h>

int main(int argc, char **argv)
{
    int i = 0;
    int status = 0;
    struct timeval timeOut = {0, 1};

    while (i == 1001)
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
            int status = ldap_result2error(ld, 0);
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
                                           "objectClass=inetOrgPerson",
                                           NULL,
                                           0,
                                           NULL,
                                           NULL,
                                           &timeOut,
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
        char *dn2, *attribute, **values, *matchedDN, *errorMessage = NULL;
        int errorCode, prc;
        BerElement *ber;

        while (searchFinished == 0)
        {
            ldapResult = ldap_result(ld, message, LDAP_MSG_ONE, &timeOut, &resultMsg);

            switch (ldapResult)
            {
            case -1:
                // flagVerification = false;
                ldap_perror(ld, "ldap_result");
                return;

            case 0:
                break;

            case LDAP_RES_SEARCH_ENTRY:
                // flagVerification = true;
                if ((dn2 = ldap_get_dn(ld, resultMsg)) != NULL)
                {
                    //resultLocal += "dn:";
                    //  resultLocal += dn;
                    ldap_memfree(dn2);

                    // resultLocal += "\n";
                }

                // You have to implement the attribute side
                //entry = ldap_first_entry(ld, resultMsg); //is this necesarry ? why not replace it with resultMsg entirely
                for (attribute = ldap_first_attribute(ld, resultMsg, &ber);
                     attribute != NULL;
                     attribute = ldap_next_attribute(ld, resultMsg, ber))
                {
                    if ((values = ldap_get_values(ld, resultMsg, attribute)) != NULL)
                    {
                        for (i = 0; values[i] != NULL; i++)
                        {
                            //use values or w/e
                        }
                        ldap_value_free(values);
                    }
                    ldap_memfree(attribute);
                }
                //resultLocal += "\n";
                ber_free(ber, 0);
                ldap_msgfree(resultMsg); //freed here ?

                //resultSearch += resultLocal;
                break;

            case LDAP_RES_SEARCH_RESULT:
                searchFinished = 1;
                status = ldap_result2error(ld, resultMsg, 0);

                prc = ldap_parse_result(ld,
                                        resultMsg,
                                        &errorCode,
                                        &matchedDN,
                                        &errorMessage,
                                        NULL,
                                        NULL,
                                        1);

                if (matchedDN != NULL && *matchedDN != 0)
                {
                    ldap_memfree(matchedDN);
                }
                ldap_msgfree(resultMsg);

                break;
            default:
                break;
            }
        }

        int unbindResult = ldap_unbind(ld);

        if (unbindResult != LDAP_SUCCESS)
        {
            printf("unbind failed with err:");
            return -1;
        }

        i++;
    }

    return 0;
}