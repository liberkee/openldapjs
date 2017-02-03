'use strict';

//Import the addon function and openLdap libraries
const client = require('./build/Release/binding');

const myClient = new client.LDAPClient();
const myClient2 = new client.LDAPClient();

const hostAddress = '10.16.0.194';
const portAddress = 389;
const Host = `ldap://${hostAddress}:${portAddress}`;
let bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
const passwordUser = 'secret';
const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
const searchFilter = '(objectclass=*)';
const scope = 2;

const initialization = myClient.initialize(Host);
const initialization2 = myClient2.initialize(Host);
  if (initialization === 0 || initialization2 === 0) {
    console.log('The initialization was not ok');
    return;
}
else {
    const binding = myClient.bind(bindDN,passwordUser);
    if (binding === 0 || binding === false) {
      console.log('The binding was not ok');
      return;
    }
   const search = myClient.search(searchBase,scope,searchFilter);
   console.log(search);
   console.log('\n\n\n\n\n\n');
   let bindDN2 = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
   const binding2 = myClient2.bind(bindDN2,passwordUser);
   if (binding2 === 0 || binding2 === false) {
      console.log('The binding was not ok');
      return;
    }
   const search2 = myClient2.search(searchBase,scope,searchFilter);
   const searchMax = myClient.search(searchBase,scope,searchFilter);
   console.log(search2);
   console.log('\n\n\n\n\n\n');
   console.log(searchMax);
}

