# LDAP Rename Operation

```javascript
    ldap.rename(dn, newRdn, newParent, controls)
```
* `dn` The distinguished name of the entry to be renamed.
* `newRdn` The new relative distinguished name for the dn.
* `newParent` The new parent for the rdn.
* `optionalControls` One or more ldap [Control](../controls.MD). _Optional_

A promise returning function that wraps the `ldap_rename` C function from the openldap API.  In Case of success it fulfils with  the result from the rename function ( whichever controls the user specified). In case of failure, it throws a custom error that can be further inspected for the cause.

Example:

```javascript
const what = 'cn=testUser2,cn=newPoint,ou=users,o=myhost,dc=demoApp,dc=com';
const newName = 'cn=newName';
const parent = 'cn=newPoint,ou=users,o=myhost,dc=demoApp,dc=com'; // same as old, can be different.

ldapClient.initialize()
  .then(() => {
    return ldapClient.bind('cn=admin,dc=demoApp,dc=com', 'secret');
  })
  .then(() => {
    return ldapClient.rename(what, newName, parent);
  })
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });


```

## References

* [LDAP DNs and RDNs](https://www.ldap.com/ldap-dns-and-rdns)
* [LDAP Rename man page](https://linux.die.net/man/3/ldap_rename)