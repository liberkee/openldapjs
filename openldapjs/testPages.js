'use strict'
const LDAPWrap = require('./modules/ldapAsyncWrap.js');
const host = 'ldap://localhost:389';
const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const searchBase = 'dc=demoApp,dc=com';
const password = 'secret';
let clientLDAP = new LDAPWrap(host);


clientLDAP.initialize()
  .then(() => {
    clientLDAP.bind(dnAdmin, password)
      .then(() => {
        let fuckCookies = '';
        clientLDAP.pagedSearch('dc=demoApp,dc=com', 2, 'objectClass=*', 2,fuckCookies)
          .then((result) => {
            console.log('result is:'+result.result);
            console.log('cookie is:'+result.cookieChain);
            console.log('more pages is:'+result.more);
            return clientLDAP.pagedSearch('dc=demoApp,dc=com', 2, 'objectClass=*', 2,result.cookieChain);  

          })
          .then( (result) => {
            console.log('-----1-----------------'+result.cookieChain);
            return clientLDAP.pagedSearch('dc=demoApp,dc=com', 2, 'objectClass=*', 2,result.cookieChain);
          })
          .then( (result) => {
            console.log('-----2-----------------'+result.cookieChain);
          })
      });

  });

