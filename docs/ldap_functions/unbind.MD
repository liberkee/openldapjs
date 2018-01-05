# LDAP Unbind Operation.

```javascript
    ldapClient.unbind()
        .then( () => {
            /* the ldap handle associated to ldapClient has been invalidated, no attempts should be made to reuse it */
        })
```

A promise returning function that terminates the client's connection to the server. In case for some reason it fails, a custom error is thrown that can be inspected. It wraps the thread safe versions of `ldap_unbind ` from the lldap_r library. 

Note: Once unbind has been called, the object becomes invalid and no further operations are possible.



```javascript
//init,bind,etc


ldapClient.unbind(); 
ldapClient.search(...,...,...); // StateError
```

## References:
* [Thread safe bind/unbind](https://www.unix.com/man-page/linux/3/ldap_destroy/)
* [LDAP unbind operation](https://www.ldap.com/the-ldap-unbind-operation)
* [RFC unbind operation](https://tools.ietf.org/html/rfc4511#section-4.3)
