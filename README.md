# OpenLDAP.JS

Node.js wrapper for [OpenLDAP](https://github.com/openldap/openldap).
This library allows you to interact through Node.js with a LDAP backend.

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
  * OpenLDAP libraries
  * SLAPD (optional)
  * [Nan](https://github.com/nodejs/nan)
  * [V8](https://github.com/v8/v8) 


### Building

OpenLDAP.js requires OpenLDAP development libraries.

### Debian/Ubuntu

* OpenLDAP development libraries : sudo apt-get install libldap2-dev
  Currently built with Openldap 2.4.45.
*  Make sure you have python2.7 and [node-gyp](https://www.npmjs.com/package/node-gyp) installed. Run `npm install`, it should install dependencies and build the c++ source files.



### MacOs
* N/a yet.

### Windows
* N/a yet.




## Testing

For the tests to run, you'll need some sample test data. In order to do this manually edit the ldapTestEntries section of the [config](./test/config.json) file and configure your local ldap data :
 host: address of your ldap server, E.g: ldap://localhost:389

 userDn: E.g: cn=admin,dc=demoApp,dc=com

 userPassword: Password for your userDn
 
 entryDn: Entrypoint for your test data, E.g: cn=newPoint,o=myhost,dc=demoApp,dc=com

 After you're done configuring, run  `npm run addData`, this should add 10k test entries to your ldap Server.

After the sample data is ready, run npm test and the tests should run.

``` npm test ```

### Test breakdown

The tests are mainly designed for testing all ldap routines (add,delete,search,modify, initialize,bind, unbind, start tls, etc.).
Test suite is composed of integration + unit tests.

## Deployment


Clone or download the repository.
Get all required packages with npm and build the addon files :
  `npm install `


**_This section should be updated as soon as we properly package it_**.

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

For more in depth examples please consult [Tests](./test) and [Samples](./sample).

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
* TODO
* [node-ldapjs](https://github.com/mcavage/node-ldapjs)
* [Nan](https://github.com/nodejs/nan) and [v8](https://github.com/v8/v8) 
* [OpenLDAP](https://github.com/openldap/openldap)


