'use strict';

const LdapClientLib = require('../index').Client;
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
    result.entry.forEach((element) => {
      console.log(JSON.stringify(element));
    });
  })
  .catch((err) => {
    console.log(err.toString());
  });
