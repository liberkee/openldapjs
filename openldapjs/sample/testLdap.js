'use strict';

const LDAPWrap = require('../modules/ldapAsyncWrap.js');

const host = process.argv[2];
const dnUser = process.argv[3];
const password = process.argv[4];
const searchBase = process.argv[5];
const searchFilter = process.argv[6];

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

