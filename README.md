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
  * SLAPD (optional)
  * [Nan](https://github.com/nodejs/nan)
  * [V8](https://github.com/v8/v8) 


### Installing

Clone or download the repository.
Get all required packages with npm and build the addon files :
  ``` npm install ```

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

For more in depth examples please consult [Tests](https://github.com/hufsm/openldapjs/tree/development/openldapjs/test) and [Samples](https://github.com/hufsm/openldapjs/tree/development/openldapjs/sample).







## Running the tests

In order for the tests to pass, you'll have to either change the test/config.json file with entries that exists in your local LDAP server schema, or do a ldapadd :
* ```ldapadd -H "ldap://your_ldap_URL:port" -D "admin dn" -w "admin password" -f test/dump.ldif ```

This will only work if your ldap schema is empty and it will populate it with test data. For a less straight forward approach, configure the config.json file with your local data. 

After the sample data is ready, run npm test and the tests should run.

``` npm test ```

### Test breakdown

The tests are mainly designed for testing all ldap routines (add,delete,search,modify, initialize,bind, unbind, start tls, etc.).
Test suite is composed of integration + unit tests.

## Deployment

This is where i'd put instructions on how to require my package....if i had one.

## Built With

* [Node-Gyp](https://github.com/nodejs/node-gyp)

## Contributing
 This project follows  the airbnb lint rules for javascript and [Clang google style](https://clang.llvm.org/docs/ClangFormatStyleOptions.html) for the C/C++ addon files. For easier collaboration, please ensure that your code is properly linted/formated before submitting a pull request.

 Any pull requests or issue reports are appreciated.


## Authors

 ### Reviewers:
  - [Michael de Paly](https://github.com/mdepaly)
  - [Philipp Tusch](https://github.com/ptusch)
  - [Yogesh Patel](https://github.com/pately)
  

 ### Developers:
  - [Cosmin Ghitea](https://github.com/cosminghitea)
  - [Maxim Rotaru](https://github.com/MaximRotaru)
  - [Radu Aribasoiu](https://github.com/Radu94)
 

See also the list of [contributors](https://github.com/hufsm/openldapjs/graphs/contributors) who participated in this project.

## License

- openldap:   OpenLDAP Public License Version 2.8

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* [Nan](https://github.com/nodejs/nan) and [v8](https://github.com/v8/v8) 


