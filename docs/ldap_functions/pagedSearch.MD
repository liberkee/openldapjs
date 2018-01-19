# LDAP Paged Search Operation.

```javascript
    ldap.pagedSearch(searchBase, scope, searchFilter, pageSize, timeVal)

```

* `searchBase` The DN of the entry at which to start the search.
* `scope` The scope of the search and should be one of BASE, to search the object itself, ONE to search the object's immediate children or SUBTREE to search the object and all its descendants.
* `searchFilter` A string representation of the filter to apply in the search
* `pageSize` how many results should be displayed on each page.
* `timeVal` The maxim amount of time the server should take in responding the page search operation (in seconds). _Optional_

A Promise returning function that resolves to a readable stream, chunking the results page by page. This should be used instead of the regular search if a large number of results is expected.

Example that searches from the top entry and console.logs 100 results at a time until it finishes or encounters an error :

```javascript
//initialize and bind
const searchBase = 'dc=example,dc=com';
const scope = 'SUBTREE';
const searchFilter = 'objectClass=*';
const pageSize = 100;

ldap.pagedSearch( searchBase, scope, searchFilter, pageSize)
    .then( (result) => {
        result.pipe(console.log);
    })
    .catch( (err) => {
        //handle error
    })
```


## References

* [Nan Paged Search Wrapper](../../src/binding.cc) & [AsyncProgress Worker](../../src/ldap_paged_search_progress.cc)
* [Javascript Source Code](../../libs/ldap_async_wrap.js)
* [Javascript Stream Interface](../../libs/stream_interface.js)