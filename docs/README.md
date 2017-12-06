# Documentation and guides

## Installing 

 TODO

## Usage

TODO : We will probably publish it as an npm package and just `npm install openldapjs`  and  
```javascript
const LDAP = require('openldapjs');
```
After installing it in your project, and assuming that you have access to a functioning LDAP server, the library can be used as following:

```javascript

/* creates a new ldap client instance with the host address your_ldap_host_address */
const ldapClient = new LDAP('your_ldap_host_address');


/* in order for the client to be usable, it has to be initialized and bound with a user DN and a password */
ldapClient.initialize()
    .then( () => {
       return ldapClient.bind('validDn','password')
    })
    .then( () => {
        //after the client is initialized and bound, you can add,search,etc.
    })
    .catch( (customError) => {
        //custom errors have a description and a code field that you can inspect
    })

```


## Functions and  tools

Most functions that interact with the LDAP server are mapped using [Nan](https://github.com/nodejs/nan) from corresponding [Openldap](https://github.com/openldap/openldap) Asynchronous C functions. The javascript bindings to those functions return [Bluebird Promises](https://github.com/petkaantonov/bluebird).

The Async C functions are processed using [AsyncProgressWorkers](https://github.com/nodejs/nan/blob/master/doc/asyncworker.md). This prevents the event loop from blocking, delegating the heavy-lifting to the worker thread(Execute method) . Upon finishing, the result gets passed to node in the HandleOkCallback method.


* [LDAP Initialize ](./ldap_functions/initialize.MD)
* [LDAP Bind](./ldap_functions/bind.MD)
* [LDAP StartTls](./ldap_functions/startTls.MD)
* [LDAP Regular search](./ldap_functions/search.MD)
* [LDAP Paged Search](./ldap_functions/pagedSearch.MD)
* [LDAP Add](./ldap_functions/add.MD)
* [LDAP Delete](./ldap_functions/delete.MD)
* [LDAP Modify](./ldap_functions/modify.MD)
* [LDAP Rename](./ldap_functions/rename.MD)
* [LDAP Change Password](./ldap_functions/changePassword.MD)
* [LDAP Unbind](./ldap_functions/unbind.MD)

State Machine illustrating library usage:

![state machine](https://user-images.githubusercontent.com/22315908/33617803-6dda8aee-d9e9-11e7-82c5-3e2e34365c55.JPG)

## Error Handling

 All errors are handled using custom errors mapped from [LDAP error codes](http://wiki.servicenow.com/index.php?title=LDAP_Error_Codes#gsc.tab=0) ranging from 1-80. For more info, check [Errors](./errors.MD).



## FAQ

List of commonly asked questions


## References 

* [LDAP](https://www.ldap.com/getting-started-with-ldap)
* [BlueBird](https://github.com/petkaantonov/bluebird)
* [LDAP Error Codes](http://wiki.servicenow.com/index.php?title=LDAP_Error_Codes#gsc.tab=0)
* [Nan](https://github.com/nodejs/nan)

