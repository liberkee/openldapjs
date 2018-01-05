# LDAP Bind Operation

```javascript

ldap.bind('userDn,dc=example,dc=com','secret')

```

* `userDn,dc=example,dc=com`  represents the ldap user distinguished name.
* `secret` represents the password for the user DN.

A promise returning function that wraps the `ldap_simple_bind` C API. It is used after initialize has finished and ,in case of success,  the client's state is upgraded from initialized to bound and the client may proceed to issue other requests. In case of failure a custom error is returned that provides details why the request failed.

Note:  Attempting to start another operation while bind is not done will most likely fail, I.E:
```javascript
//BAD
ldap.initialize();
ldap.bind('username','pass');
ldap.search(...,...,...);
```

Always wait for initialize/bind to finish before using other ops:

```javascript
//Good
ldap.initialize()
    .then( () => {
        return ldap.bind('username','password')

    })
    .then( () => {
      return  ldap.search(searchBase, searchScope, searchFilter)
    })
    .then( (result) => {
        console.log('search result is: ' + result);
    })
```


## References

* [LDAP Bind manpage](https://linux.die.net/man/3/ldap_simple_bind_s)
* [LDAP Bind specs](https://www.ldap.com/the-ldap-bind-operation)
* [RFC Bind operation](https://tools.ietf.org/html/rfc4511#section-4.2)