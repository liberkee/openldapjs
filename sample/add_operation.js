'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');
const ldif = require('ldif');
const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

const entry = [
  config.ldapAdd.firstAttr,
  config.ldapAdd.secondAttr,
  config.ldapAdd.thirdAttr,
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
    return newClient.add(config.ldapAdd.dnNewEntry, entry);
  })
  .then(() => {
    console.log('The user was added with success');
    return newClient.add(config.ldapAdd.secondDnNewEntry, entry,
      config.ldapControls.ldapModificationControlPostRead);
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
