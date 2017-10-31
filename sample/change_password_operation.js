'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const newClient = new LdapClientLib('ldap://localhost:389');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

newClient.initialize()
  .then(() => {
    return newClient.startTLS('/etc/ldap/ca_certs.pem');
  })
  .then(() => {
    return newClient.bind(`cn=cbuta,${dn}`, 'secret');
  })
  .then(() => {
    return newClient.changePassword(`cn=cbuta,${dn}`, 'secret', 'newPassword');
  })
  .then(() => {
    console.log('The user password was changed with success');
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });
