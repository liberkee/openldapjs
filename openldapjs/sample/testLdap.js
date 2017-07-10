'use strict';

const LDAPWrap = require('../modules/ldapAsyncWrap.js');


/**
 * an example of program ussage would be node testLdap.js YourHost YourUserDN YourUserPassword Base SearchFIlter                                                                                                 
 */

const method = process.argv[2]

if (method === 'search') {
  search();
} else if (method === 'modify') {
  modify();
} else {
  console.log('The operation is invalid');
}



function search() {
  const host = process.argv[3];
  const dnUser = process.argv[4];
  const password = process.argv[5];
  const searchBase = process.argv[6];
  const searchFilter = process.argv[7];

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
}

//node testLdap.js modify "ldap://10.16.0.194:389" "cn=admin,dc=demoApp,dc=com" "secret" 
function modify() {
  const host = process.argv[3];
  const dnUser = process.argv[4];
  const password = process.argv[5];
  //const dn = process.argv[6];
  //const mods = process.argv[7];
  const clientLDAP = new LDAPWrap(host);

  clientLDAP.initialize()
    .then( () => {
      clientLDAP.bind(dnUser,password)
      .then( () =>{
        clientLDAP.modify()
          .then( (result) => {
            console.log(result);
          });
      });
        
    });

}

