# LDAP Modify Operation

```javascript

    ldap.modify(dnToBeChanged, changes, optionalControls);
```
* `dnToBeChanged` entry that will be modified.
* `changes` Object that contains changes to be made.
* `optionalControls` optional control parameter.

Modify example:

```javascript

const dnToBeChanged = 'cn=userDn,ou=users,o=myhost,dc=example,dc=com';
const changes = {
    op: "replace",
    attr: "address",
    vals: "New Address, nr 23"

}


//changes the address from the previous value to "New Address,nr 23"
ldap.modify(dnToBeChanged, changes)



```

A promise returning function that wraps the `ldap_modify_ext` asynchronous C function from the openldap API. In case of success, the entry is modified and the promise resolves depending on the controls provided. In case of failure, it the promise rejects with a custom error that can be further inspected.


## References 

* [LDAP Modify man page](https://linux.die.net/man/3/ldap_modify_ext)
* [LDAP Modify specs](https://www.ldap.com/the-ldap-modify-operation)