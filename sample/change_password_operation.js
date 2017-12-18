'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');
const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

newClient.initialize()
  .then(() => {
    return newClient.startTLS(config.ldapAuthentication.pathFileToCert);
  })
  .then(() => {
    return newClient.bind(config.ldapAuthentication.dnUser, config.ldapAuthentication.passwordUser);
  })
  .then(() => {
    return newClient.changePassword(config.ldapAuthentication.dnUser,
      config.ldapChangePassword.oldPasswd, config.ldapChangePassword.newPasswd);
  })
  .then(() => {
    console.log('The user\'s password was changed with success');
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });
