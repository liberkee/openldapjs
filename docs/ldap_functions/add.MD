# LDAP Add Operation

```javascript
    ldap.add(distinguishedName,entryObject,optionalControls);
```

* `distinguishedName`, Dn where the entryObject is to be added.
* `entryObject`, LDAP entry object to be added to the provided DN

Example usecase:

```javascript

const entryObject = {
    attr: "objectClass",
    vals: ["person"]

};

ldap.initialize(...)
    .then( () => {
        return ldap.bind(..,..)
    })
    .then( () => {
        ldap.add(dn,entryObject,optionalControls)
    })

```

A promise returning function that wraps the `ldap_add_ext` C asynchronous function from the openldap API. In Case of success it fulfils with  the result from the add function ( whichever controls the user specified). In case of failure, it throws a custom error that can be further inspected for the cause.

Multiple adds can be executed in parallel (only limit to how many adds can be chunked is the ldap server limitation). A small example on how adds can be chunked can be found in the [populate](../../populate.js) script.


## References:

* [LDAP Add](https://linux.die.net/man/3/ldap_add_ext)
* [Nan Add Wrapper](../../src/binding.cc) & [AsyncProgress Worker](../../src/ldap_add_progress.cc)
* [Javascript Source Code](../..libs/ldap_async_wrap.js)

