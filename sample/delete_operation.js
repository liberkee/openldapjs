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
    return newClient.delete(config.ldapDelete.dnNewEntry);
  })
  .then(() => {
    console.log('The user was deleted with success');
    return newClient.delete(config.ldapDelete.secondDnNewEntry,
      config.ldapControls.ldapModificationControlPreRead);
  })
  .then((result) => {
    const outputOptions = {};

    const JSONstructure = result.toObject(outputOptions);
    JSONstructure.entries.forEach((element) => {
      console.log(element);
    });
  })
  .catch((err) => {
    console.log(err.toString());
  });
