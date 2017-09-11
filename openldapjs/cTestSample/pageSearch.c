#include <ldap.h>
#include <lber.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/select.h>

//#define BIND_DN "cn=admin,dc=demoApp,dc=com"
//#define BIND_PW "secret"
#define LDAP_FALSE 0
#define LDAP_TRUE 1

char *server, *base, *filter, *scopes[] = {"BASE", "ONELEVEL", "SUBTREE"};
int scope;
char *BIND_DN = "cn=admin,dc=demoApp,dc=com";
char *BIND_PW = "secret";
LDAP *ld;

int main(int argc, char** argv)
{
    BerElement *ber;
    int l_rc, l_entries, l_port, l_entry_count = 0, morePages, l_errcode = 0, page_nbr;
    unsigned long pageSize;
    struct berval *cookie = NULL;
    char pagingCriticality = 'T', *l_dn;
    unsigned long totalCount;
    LDAPControl *pageControl = NULL, *M_controls[2] = {NULL, NULL}, **returnedControls = NULL;
    LDAPMessage *l_result, *l_entry;
    int msgId = 0;
    char *attribute;
    char **values;

    server = "ldap://localhost:389";

    base = "dc=demoApp,dc=com";
    filter = "objectClass=person";
    scope = 2;
    pageSize = 30;
    /*                                                                */
    /******************************************************************/

    /******************************************************************/
    /* Initialize an LDAP session                                     */
    /*                                                                */
    printf("before init");
    int initializeResult = ldap_initialize(&ld, server);
    printf("initialized!");
    /* Check if connection is OK                                      */
    if (ld == NULL || initializeResult != 0)
    {
        printf("==Error==");
        printf("  Init of server %s at port %d failed.\n", server, l_port);
        return -1;
    }

    int version = LDAP_VERSION3;
    
            ldap_set_option(ld, LDAP_OPT_PROTOCOL_VERSION, &version);
    /*                                                                */
    /******************************************************************/

    /******************************************************************/
    /* Bind as the ldap administrator                                 */
    /*                                                                */
    l_rc = ldap_simple_bind_s(ld, BIND_DN, BIND_PW);
    if (l_rc != LDAP_SUCCESS)
    {
        printf("==Error== ");
        printf("  Unable to Bind to the LDAP server.  Return code is %d.\n", l_rc);
        return 0;
    }
    /*                                                                */
    /******************************************************************/

    page_nbr = 1;

    /******************************************************************/
    /* Get one page of the returned results each time                 */
    /* through the loop                                               */
    do
    {
        l_rc = ldap_create_page_control(ld, pageSize, cookie, pagingCriticality, &pageControl);

        /* Insert the control into a list to be passed to the search.     */
        M_controls[0] = pageControl;

        /* Search for entries in the directory using the parmeters.       */
        l_rc = ldap_search_ext(ld, base, scope, filter, NULL, 0, M_controls, NULL, NULL, 0, &msgId);
        if ((l_rc != LDAP_SUCCESS))
        {
            printf("==Error==");
            printf("  Failure during a search.  Return code is %d.\n", l_rc);
            ldap_unbind(ld);
            break;
        }

        int pagedResult = 0;
        struct timeval timeOut = {1, 0};
        while (pagedResult == 0)
        {
            pagedResult = ldap_result(ld, msgId, 1, &timeOut, &l_result);
        }

        /* Parse the results to retrieve the contols being returned.      */
        l_rc = ldap_parse_result(ld, l_result, &l_errcode, NULL, NULL, NULL, &returnedControls, LDAP_FALSE);

        if (cookie != NULL)
        {
            ber_bvfree(cookie);
            cookie = NULL;
        }

        /* Parse the page control returned to get the cookie and          */
        /* determine whether there are more pages.                        */
        l_rc = ldap_parse_page_control(ld, returnedControls, &totalCount, &cookie);

        /* Determine if the cookie is not empty, indicating there are more pages */
        /* for these search parameters. */
        if (cookie && cookie->bv_val != NULL && (strlen(cookie->bv_val) > 0))
        {
            morePages = LDAP_TRUE;
        }
        else
        {
            morePages = LDAP_FALSE;
        }

        /* Cleanup the controls used. */
        if (returnedControls != NULL)
        {
            ldap_controls_free(returnedControls);
            returnedControls = NULL;
        }
        M_controls[0] = NULL;
        ldap_control_free(pageControl);
        pageControl = NULL;

        /******************************************************************/
        /* Disply the returned result                                     */
        /*                                                                */
        /* Determine how many entries have been found.                    */
        if (morePages == LDAP_TRUE)
            printf("===== Page : %d =====\n", page_nbr);
        l_entries = ldap_count_entries(ld, l_result);

        if (l_entries > 0)
        {
            l_entry_count = l_entry_count + l_entries;
        }

        for (l_entry = ldap_first_entry(ld, l_result);
             l_entry != NULL;
             l_entry = ldap_next_entry(ld, l_entry))
        {
            l_dn = ldap_get_dn(ld, l_entry);
            printf("    %s\n", l_dn);


            for (attribute = ldap_first_attribute(ld, l_entry, &ber);
            attribute != NULL;
            attribute = ldap_next_attribute(ld, l_entry, ber))
       {
         if ((values = ldap_get_values(ld, l_entry, attribute)) != NULL)
         {
           for (int i = 0; values[i] != NULL; i++)
           {
              printf("%s:",attribute);
             //resultLocal += ":";
             printf("%s\n",values[i]);
             //resultLocal += "\n";
           }
           ldap_value_free(values);
         }
       //  std::cout<<"------173----"<<std::endl;
         ldap_memfree(attribute);
       }
        }

        /* Free the search results.                                       */
        ldap_msgfree(l_result);
        page_nbr = page_nbr + 1;

    } while (morePages == LDAP_TRUE);

    printf("\n  %d entries found during the search", l_entry_count);
    /* Free the cookie since all the pages for these search parameters   */
    /* have been retrieved.                                              */
    ber_bvfree(cookie);
    cookie = NULL;

    /* Close the LDAP session.                                           */
    ldap_unbind(ld);

    return 0;
}
