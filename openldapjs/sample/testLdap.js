'use strict';

const LDAPWrap = require('../modules/ldapAsyncWrap.js');

const host = 'ldap://localhost:389';
const dnUser = 'cn=admin,dc=demoApp,dc=com';
const searchBase = 'dc=demoApp,dc=com';
const password = 'secret';
const searchFilter = process.argv[2];

const clientLDAP = new LDAPWrap(host);

clientLDAP.initialize()
  .then( () => {
    clientLDAP.bind(dnUser,password)
    .then( () =>{
      clientLDAP.search(searchBase,2,searchFilter)
        .then( (result) => {
          console.log(result);
        });
    });
      
  });

