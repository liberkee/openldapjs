# LDAP Rename Operation

```javascript
    ldap.rename(dn, newRdn, newParent, controls)
```
* `dn` The distinguished name of the entry to be renamed.
* `newRdn` The new relative distinguished name for the dn.
* `newParent` The new parent for the rdn.
* `controls` Optional control parameter.

A promise returning function that wraps the `ldap_rename` C function from the openldap API.  In Case of success it fulfils with  the result from the rename function ( whichever controls the user specified). In case of failure, it throws a custom error that can be further inspected for the cause.

##References

* [LDAP DNs and RDNs](https://www.ldap.com/ldap-dns-and-rdns)
* [LDAP Rename man page](https://linux.die.net/man/3/ldap_rename)