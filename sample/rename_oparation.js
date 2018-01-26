'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');
const ldif = require('ldif');

const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

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
    return newClient.rename(config.ldapRename.firstDNChange, config.ldapRename.firstRDN,
      config.ldapRename.newParent);
  })
  .then(() => {
    console.log('The user was renamed with success');
    return newClient.rename(config.ldapRename.secondDNChange, config.ldapRename.secondRDN,
      config.ldapRename.newParent, prePostReadControls);
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
