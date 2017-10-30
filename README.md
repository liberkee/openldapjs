# OpenLDAP.JS

Node.js wrapper for [OpenLDAP](https://github.com/openldap/openldap) C library.

## Getting Started

* Clone or download repository.
* Install dependencies.
* [V8 Embedder's guide](https://github.com/v8/v8/wiki/Embedder's-Guide) Useful documentation + examples if you want a deeper look at how    embedding is done.
* [Nan](https://github.com/nodejs/nan) Nan examples, documentation and source.
* [LDAP](https://www.ldap.com) & [OpenLDAP](http://www.openldap.org/) documentation and resources.


### Prerequisites

* Install all dependencies :
  * Node.js(>version 4.8.5)
  * NPM
  * OpenLDAP libraries : apt-get install libldap-2.4.2
  * SLAPD
  * [Nan](https://github.com/nodejs/nan)
  * [V8](https://github.com/v8/v8) 


### Installing

* Get all required packages with npm :
  ``` npm install ```

* Build the C++ libraries:
    * ```node-gyp configure```
    * ``` node-gyp build```

The Node.JS wrapper for the library is libs/ldap_async_wrap.js, require it in your software like :
```javascript
const LdapClient = require('./libs/ldap_async_wrap.js');
```

A normal workflow would be :
```javascript
const ldapClientInstance = new LdapClient('ldap://your_ldap_server:PORT');

ldapClientInstance.initialize()
    .then(() => {
      return ldapClientInstance.bind(userDn,userPassword)
    })
    .then( () => {
      ldapClientInstance.search(...);
      ldapClientInstance.add(...);
      ldapClientInstance.delete(...);
      ldapClientInstance.modify(...);
    });
```





## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With



## Contributing



## Versioning



## Authors


See also the list of [contributors](https://github.com/hufsm/openldapjs/graphs/contributors) who participated in this project.

## License

- openldap:   OpenLDAP Public License Version 2.8

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc


