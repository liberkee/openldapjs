'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

newClient.initialize()
  .then(() => {
    return newClient.startTLS(config.ldapAuthentication.pathFileToCert);
  })
  .then(() => {
    return newClient.bind('cn=admin,dc=demoApp,dc=com', config.ldapAuthentication.passwordUser);
  })
  .then(() => {
    console.log('Bind success');
    return newClient.extendedOperation('1.3.6.1.4.1.4203.1.11.1',
      {userDN: 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com',
        oldPass: 'secret',
        newPass: 'secret'});
  })
  /* .then((result) => {
    console.log(`Extended result: ${result}`);
    return newClient.extendedOperation('1.3.6.1.1.8',
      {first: 1});
  }) */
  .then((result) => {
    console.log(`Extended result: ${result}`);
    return newClient.extendedOperation('1.3.6.1.4.1.1466.101.119.1', 'cn=admin,dc=demoApp,dc=com');
  })
  .then((result) => {
    console.log(`Extended result: ${result}`);
  })
  .catch((err) => {
    console.log(`Here ${err.name} ${err.constructor.code}`);

  });
