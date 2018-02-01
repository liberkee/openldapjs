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
    return newClient.pagedSearch(config.ldapSearch.searchBase, config.ldapSearch.scope.one,
      config.ldapSearch.filter, config.ldapSearch.pageSize);
  })
  .then((result) => {
    let pageNumber = 0;
    result.on('data', (data) => {
      console.log('-----------------------------------');
      console.log(`The page number is ${pageNumber += 1}`);
      console.log('-----------------------------------');
      const outputOptions = {};

      const JSONstructure = data.toObject(outputOptions);
      console.log(`LDIF structure: ${data.toString()}`);
      JSONstructure.entries.forEach((element) => {
        console.log(element);
      });
    });

    result.on('err', (err) => {
      console.log('-----------------');
      console.error(`Error name: ${err.name}`);
      console.error(`Error code: ${err.code}`);
      console.error(`Error description: ${err.description}`);
      console.log('-----------------');
    });

    result.on('end', () => {
      console.log('\nStream ends  here');
    });
  })
  .catch((err) => {
    console.log(err.toString());
  });
