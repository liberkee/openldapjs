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
    return newClient.bind('cn=admin,dc=demoApp,dc=com', config.ldapAuthentication.passwordUser);
  })
  .then(() => {
    console.log('Bind successfully');
    return newClient.search(config.ldapSearch.searchBase, config.ldapSearch.scope.one,
      config.ldapSearch.filter);
  })
  .then((result) => {
    result.entry.forEach((element) => {
      console.log(JSON.stringify(element));
    });
  })
  .catch((err) => {
    console.log(err.toString());
  });
