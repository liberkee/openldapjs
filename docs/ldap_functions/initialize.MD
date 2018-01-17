# LDAP Initialize Operation

```javascript
     ldap.initialize();
```



A promise returning function that wraps the `ldap_initialize` C function from the openldap API.
In case of success, the client's state is initialized and you can proceed to bind. In case of failure, an error is returned and the client's state remains unchanged.

Note:  Attempting to start another operation while initialize is not done will most likely fail, I.E:
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


##  References:

* [LDAP Initialize man page](https://linux.die.net/man/3/ldap_initialize)
* [Nan Initialize wrapper ](../../src/binding.cc)
* [Javascript source code](../../libs/ldap_async_wrap.js)


