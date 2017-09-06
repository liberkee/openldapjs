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
        let searchID = 1;
        clientLDAP.pagedSearch('dc=demoApp,dc=com', 2, 'objectClass=*', 100,searchID)
          .then((result) => {
            console.log('Page 1:\n'+result);
         
            return clientLDAP.pagedSearch('dc=demoApp,dc=com', 2, 'objectClass=*',100,searchID);  

          })
          .then( (result) => {
           console.log('Page 2:\n'+result);
            return clientLDAP.pagedSearch('dc=demoApp,dc=com', 2, 'objectClass=*', 100,searchID);
          })
          .then( (result) => {
            console.log('Page3:\n'+result);
      
          })
      });

  });

  