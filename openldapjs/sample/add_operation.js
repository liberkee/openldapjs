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

    const entry = [
      {
        attr: 'objectClass',
        vals: ['top', 'person'],
      },
      {
        attr: 'sn',
        vals: ['New User', 'New Name'],
      },
      {
        attr: 'description',
        vals: ['First description', 'Second description', 'Last description'],
      },
    ];

    return newClient.add(`cn=newUser01,${dn}`, entry);
  })
  .then(() => {
    console.log('The user was add with success');
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });
