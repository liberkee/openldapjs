# LDAP Search Operation

```javascript
ldap.search(searchBase, scope, searchFilter, timeVal)

```

* `searchBase` The DN of the entry at which to start the search.
* `scope` The scope of the search and should be one of BASE, to search the object itself, ONE to search the object's immediate children or SUBTREE to search the object and all its descendants.
* `searchFilter` A string representation of the filter to apply in the search
* `timeVal` The maxim amount of time the server should take in responding the rename operation (in seconds). _Optional_

A Promise returning function that wraps the asynchronous `ldap_search_ext` C function from the openldap C API. It fulfils with the value of the search result or rejects with a custom error that can be further inspected.

## References:

* [LDAP search man page](https://linux.die.net/man/3/ldap_search_ext)
* [LDAP search specs](http://www.openldap.org/search/)
* [RFC search operation](https://tools.ietf.org/html/rfc4511#section-4.5)


