'use strict';

const LdapClientLib = require('../index').Client;

const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

const prePostReadControls = [
  '1.3.6.1.1.13.2',
  '1.3.6.1.1.13.1',
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
    result.entry.forEach((element) => {
      console.log(JSON.stringify(element));
    });
  })
  .catch((err) => {
    console.log(err.toString());
  });
