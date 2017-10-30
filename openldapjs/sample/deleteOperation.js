'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

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

  return newClient.delete(`cn=newUser01,${dn}`);
})
.then(() => {
  console.log("The user was deleted with success");
})
.catch((err) => {
  console.log(`${err.name} ${err.constructor.description}`);
});