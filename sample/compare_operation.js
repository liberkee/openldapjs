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
    return newClient.bind(config.ldapAuthentication.dnUser, config.ldapAuthentication.passwordUser);
  })
  .then(() => {

    return newClient.compare(config.ldapAuthentication.dnUser, config.ldapCompare.attribute, config.ldapCompare.value);
  })
  .then((result) => {
    console.log(`Compare result: ${result}`);
    return newClient.compare(config.ldapAuthentication.dnUser, config.ldapCompare.attribute, config.ldapCompare.wrongValue);
  })
  .then((result) => {
    console.log(`Compare result: ${result}`);
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });
