'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

newClient.initialize()
  .then(() => {
    console.log('Init successfully');
    return newClient.startTLS(config.ldapAuthentication.pathFileToCert);
  })
  .then(() => {
    console.log('TLS successfully');
    return newClient.bind(config.ldapAuthentication.dnUser, config.ldapAuthentication.passwordUser);
  })
  .then(() => {
    console.log('Bind successfully');
    return newClient.extendedOperation(config.ldapExtendedOperation.oid.changePassword,
      [config.ldapAuthentication.dnUser,
        config.ldapChangePassword.oldPasswd,
        config.ldapChangePassword.newPasswd]);
  })
  .then(() => {
    console.log('The user\'s password was changed with success');
  })
  .then(() => {
    return newClient.extendedOperation(config.ldapExtendedOperation.oid.whoAmI);
  })
  .then((res) => {
    console.log(`The current user is: ${res}`);
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });

