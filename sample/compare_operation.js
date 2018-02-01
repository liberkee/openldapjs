'use strict';

const LdapClientLib = require('../index').Client;

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
    return newClient.compare(config.ldapAuthentication.dnUser,
      config.ldapCompare.attribute, config.ldapCompare.value);
  })
  .then((result) => {
    console.log(`Compare result: ${result}`);
    return newClient.compare(config.ldapAuthentication.dnUser,
      config.ldapCompare.attribute, config.ldapCompare.wrongValue);
  })
  .then((result) => {
    console.log(`Compare result: ${result}`);
  })
  .catch((err) => {
    console.log(err.toString());
  });
