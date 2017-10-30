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

  const changes = [
    {
      op: 'add',
      attr: 'telephoneNumber',
      vals: ['0744429'],
    },
    {
      op: 'delete',
      attr: 'description',
      vals: ['First description', 'Second description'],
    },
    {
      op: 'replace',
      attr: 'sn',
      vals: ['User New Name'],
    },
  ]

  return newClient.modify(`cn=newUser01,${dn}`, changes);
})
.then(() => {
  console.log("The user was modify with success");
})
.catch((err) => {
  console.log(`${err.name} ${err.constructor.description}`);
});