'use strict';

const LdapClientLib = require('../index').Client;
const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

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
    return newClient.changePassword(config.ldapAuthentication.dnUser,
      config.ldapChangePassword.oldPasswd, config.ldapChangePassword.newPasswd);
  })
  .then(() => {
    console.log('The user\'s password was changed with success');
  })
  .catch((err) => {
    console.log(err.toString());
  });
