'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const ldif = require('ldif');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

const changes = [
  config.ldapModify.ldapModificationAdd,
  config.ldapModify.ldapModificationDelete,
  config.ldapModify.ldapModificationReplace,
];

const prePostReadControls = [
  config.ldapControls.ldapModificationControlPostRead,
  config.ldapControls.ldapModificationControlPreRead,
];

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
    return newClient.modify(config.ldapModify.firstDNEntry, changes);
  })
  .then(() => {
    console.log('The user was modified with success');
    return newClient.modify(config.ldapModify.secondDNEntry, changes, prePostReadControls);
  })
  .then((result) => {
    const resultJson = ldif.parse(result);
    const outputOptions = {};

    const JSONstructure = resultJson.toObject(outputOptions);
    JSONstructure.entries.forEach((element) => {
      console.log(element);
    });
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });
