# LDAP Delete Operation

```javascript
    ldap.delete(dn,optionalControls);
```

* `dn` distinguished name to be deleted, must be a leaf.
* `optionalControls` One or more ldap [Control](../controls.MD). _Optional_

A promise returning function that wraps the `ldap_delete_ext` C asynchronous function from the openldap API. In case of success it fulfils with the result from the delete function( depends on what controls you provided). In case of failure, it throws a custom error that can be further inspected for the cause.

Example use case:
```javascript

const toBeDeleted = 'cn=obsoleteData,cn=data,ou=database,o=myhost,dc=example,dc=com';

ldap.initialize()
    .then( () => {
        return ldap.bind(..,..)
    })
    .then( () => {
        ldap.delete(toBeDeleted,optionalControls)
    })

```
The snippet above will delete the given dn together with all its entry data.

## References:

* [LDAP Delete man page](https://linux.die.net/man/3/ldap_delete_ext)
* [LDAP Delete specs](https://www.ldap.com/the-ldap-delete-operation)
* [RFC Delete operation](https://tools.ietf.org/html/rfc4511#section-4.8)


