'use strict';

const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const ldif = require('ldif');

function search() {
  const host = process.argv[3];
  const dnUser = process.argv[4];
  const password = process.argv[5];
  const searchBase = process.argv[6];
  const searchFilter = process.argv[7];

  const clientLDAP = new LDAPWrap(host);

  clientLDAP.initialize()
      .then(() => { return clientLDAP.bind(dnUser, password); })
      .then(() => { return clientLDAP.search(searchBase, 'SUBTREE', searchFilter); })
      .then((result) => {console.log(ldif.parse(result))});
}

/* node testLdap.js modify "ldap://10.16.0.194:389" "cn=admin,dc=demoApp,dc=com"
 "secret"
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

  const controlJson = [
    {
      oid: 'postread',
      value: ['entryCSN', 'entryUUID'],
      iscritical: false,
    },
    {
      oid: 'preread',
      value: ['entryCSN', 'sn'],
      iscritical: false,
    },
  ];

  const changes = [
    {
      op: 'delete',
      attr: 'userPassword',
      vals: ['cosmin'],
    },
    {
      op: 'add',
      attr: 'userPassword',
      vals: ['secret'],
    },
  ];


  const attributeArray = ['cn', 'entryCSN', 'description', 'entryUUID'];

  clientLDAP.initialize()
      .then(() => { return clientLDAP.bind(dnUser, password); })
      .then(() => { return clientLDAP.newModify(userDnModify, changes); })
      .then((result) => { console.log(result); });
}

/**
 * an example of program usage would be:
 * 1. SEARCH
 * node testLdap.js search 'ldap://localhost:389' 'cn=admin,dc=demoApp,dc=com'
 * 'secret' 'dc=demoApp,dc=com' 'objectClass=*'
 *
 * 2. MODIFY
 * node testLdap.js modify 'ldap://localhost:389' 'cn=admin,dc=demoApp,dc=com'
 * 'secret'
 */

const method = process.argv[2];

if (method === 'search') {
  search();
} else if (method === 'modify') {
  modify();
} else {
  console.log('The operation is invalid');
}
