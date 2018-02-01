# LDAP Errors 

The LDAP server's response to requests is usually a number representing either success(0) or an error(1-80).

In order for these to be more meaningful this library has a custom error handler that maps the error code to a javascript error with 2 extra fields,the error code( a number between 1 and 80) and a description( String that contains information about the error and why it ocurred ). Some errors  thrown by the server aren't mapped( API errors that have negative error codes and other errors that are implementation specific), those  are mapped to `LdapOtherError` by default.

```javascript

//init and bind

ldapClient.add(dn,entry)
    .then( () => {
      return  ldapClient.add(dn,entry) //attempting to add the same entry twice
    })
    .catch((err)=> {
        //LdapAlreadyExistsError with error code 68
    })
    .catch(LdapInvalidSyntaxError, (err) => {
        // toString() displays error.code: error.description
        console.log(err.toString());
        //catching specific errors
    })
```

More examples of error handling can be found in [Tests](../test).

## References:

* [LDAP Result Code Reference](https://www.ldap.com/ldap-result-code-reference)
