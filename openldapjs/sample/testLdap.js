'use strict';

const LDAPWrap = require('../modules/ldapAsyncWrap.js');


/**
 * an example of program ussage would be:
 * 1. SEARCH
 * node testLdap.js search 'ldap://localhost:389' 'cn=admin,dc=demoApp,dc=com' 'secret' 'dc=demoApp,dc=com' 'objectClass=*' 
 * 
 * 2. MODIFY
 * node testLdap.js modify 'ldap://localhost:389' 'cn=admin,dc=demoApp,dc=com' 'secret'                                                                                        
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
    .then(() => {
      clientLDAP.bind(dnUser, password)
        .then(() => {
          clientLDAP.search(searchBase, 2, searchFilter)
            .then((result) => {
              console.log(result);
              console.log(result.length);
            });
        });

    });
}

/* node testLdap.js modify "ldap://10.16.0.194:389" "cn=admin,dc=demoApp,dc=com" "secret"
 * Example of JSON to pass to method modify
 * JSON = {
 *  operation: 'add' || 'replace' || 'delete'
 *  modification: {         -> This member is not needed for Delete operations
 *    objectClass:'person',
 *    sn:'newSN',
 *    description:'OurNewObject'
 *  }
 * }

*/
function modify() {
  const host = process.argv[3];
  const dnUser = process.argv[4];
  const password = process.argv[5];
  const clientLDAP = new LDAPWrap(host);

  const userDnModify = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const changes = [
    {
      op: 'replace',
      attr: 'description',
      vals: ['asdaaa----------------']
    },
    {
      op: 'add',
      attr: 'description',
      vals: ['a', 'b', 'c',]
    }
  ];

  const attributeArray = ['cn', 'entryCSN', 'description']; 

  clientLDAP.initialize()
    .then(() => {
      clientLDAP.bind(dnUser, password)
        .then(() => {
          clientLDAP.newModify(userDnModify, changes, attributeArray)
            .then((result) => {
              console.log(result);
            })
        });

    });

}

