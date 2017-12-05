# LDAP Delete Operation

```javascript
    ldap.delete(dn,optionalControls);
```

* `dn`, distinguished name to be deleted, must be a leaf.
* `optionalControls`, optional controls.

A promise returning function that wraps the `ldap_delete_ext` C asynchronous function from the openldap API. In case of success it fulfils with the result from the delete function( depends on what controls you provided). In case of failure, it throws a custom error that can be further inspected for the cause.

Example use case:
```javascript
ldap.initialize(...)
    .then( () => {
        return ldap.bind(..,..)
    })
    .then( () => {
        ldap.delete(dn,optionalControls)
    })

```

## References:

* [LDAP Delete](https://linux.die.net/man/3/ldap_delete_ext)
* [Nan Delete Wrapper](../../src/binding.cc) & [AsyncProgress Worker](../../src/ldap_delete_progress.cc)
* [Javascript Source Code](../../libs/ldap_async_wrap.js)

