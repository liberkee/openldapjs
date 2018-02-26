'use strict';

const LdapClientLib = require('../index').Client;

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

const changes = [
  config.ldapModify.ldapModificationAdd,
  config.ldapModify.ldapModificationDelete,
  config.ldapModify.ldapModificationReplace,
];

const prePostReadControls = [
  {
    oid: '1.3.6.1.1.13.1',
    value: ['cn'],
    isCritical: false,
  },
  {
    oid: '1.3.6.1.1.13.2',
    value: ['cn'],
    isCritical: false,
  },
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
    result.entry.forEach((element) => {
      console.log(JSON.stringify(element));
    });
  })
  .catch((err) => {
    console.log(err.toString());
  });
