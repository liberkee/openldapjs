'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const ldif = require('ldif'); 

const newClient = new LdapClientLib('ldap://localhost:389');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

newClient.initialize()
.then (() => {
  return newClient.startTLS('/etc/ldap/ca_certs.pem');
})
.then(() => {
  return newClient.bind(`cn=cbuta,${dn}`, 'secret');
})
.then(() => {

  return newClient.search(dn, 'SUBTREE', 'cn=newUser01');
})
.then((result) => {
  const resultJson = ldif.parse(result);
  console.log(`LDIF structure: ${result}`);
  console.log('\n\n');
  console.log(`JSON structure: \n ${JSON.stringify(resultJson)}`);
})
.catch((err) => {
  console.log(`${err.name} ${err.constructor.description}`);
});