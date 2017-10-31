'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const ldif = require('ldif');

const newClient = new LdapClientLib('ldap://localhost:389');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

newClient.initialize()
  .then(() => {
    return newClient.startTLS('/etc/ldap/ca_certs.pem');
  })
  .then(() => {
    return newClient.bind(`cn=cbuta,${dn}`, 'secret');
  })
  .then(() => {

    return newClient.pagedSearch(dn, 'ONE', 'cn=*', 2);
  })
  .then((result) => {
    let pageNumber = 0;
    result.on('data', (data) => {
      console.log('-----------------------------------');
      console.log(`The page number is ${pageNumber += 1}`);
      console.log('-----------------------------------');
      const resultJson = ldif.parse(data.toString());
      const outputOptions = {};

      const JSONstructure = resultJson.toObject(outputOptions);
      console.log(`LDIF structure: ${data.toString()}`);
      JSONstructure.entries.forEach((element) => {
        console.log(element);
      });
    });

    result.on('err', (err) => {
      console.log('-----------------');
      console.error(`Error name: ${err.name}`);
      console.error(`Error code: ${err.constructor.code}`);
      console.error(`Error description: ${err.constructor.description}`);
      console.log('-----------------');
    });

    result.on('end', () => {
      console.log('\nStream end up here');
    });
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });
