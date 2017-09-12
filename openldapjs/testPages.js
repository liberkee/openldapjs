'use strict';


const LDAPWrap = require('./modules/ldapAsyncWrap.js');
const host = 'ldap://localhost:389';
const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const searchBase = 'dc=demoApp,dc=com';
const password = 'secret';
let clientLDAP = new LDAPWrap(host);


clientLDAP.initialize().then(() => {
  clientLDAP.bind(dnAdmin, password).then(() => {
    clientLDAP.pagedSearch(searchBase, 2, 'objectClass=*', 10)
        .pipe(process.stdout);


  });

});
