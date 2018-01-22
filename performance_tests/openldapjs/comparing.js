'use strict';

const Client = require('../../index.js').Client;
const Promise = require('bluebird');


const t0 = process.hrtime();
const ldapClient = new Client('ldap://localhost:389');
const promiseArray = [];

ldapClient.initialize()
  .then(() => {
    return ldapClient.bind('cn=admin,dc=demoApp,dc=com', 'secret');
  })
  .then(() => {
    for (let i = 0; i < 100; i++) {
      promiseArray.push(ldapClient.compare('cn=admin,dc=demoApp,dc=com', 'objectClass', 'simpleSecurityObject'));
    }

    return Promise.all(promiseArray);
  })
  .then(() => {
    const end = process.hrtime(t0);
    console.log('Comparing took: %ds %dms', end[0], end[1] / 1e6);
  })
  .catch((err) => {
    throw err;
  });

