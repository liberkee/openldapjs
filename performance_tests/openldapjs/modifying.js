'use strict';

const Client = require('../../index.js').Client;
const Promise = require('bluebird');


const t0 = process.hrtime();
const ldapClient = new Client('ldap://localhost:389');
const promiseArray = [];

const changes = {
  op: 'replace',
  attr: 'sn',
  vals: ['bla'],
};

const control = [
  {
    oid: 'preread',
    value: ['cn'],
    isCritical: false,
  },
  {
    oid: 'postread',
    value: ['cn'],
    isCritical: false,
  },
];

ldapClient.initialize()
  .then(() => {
    return ldapClient.bind('cn=admin,dc=demoApp,dc=com', 'secret');
  })
  .then(() => {
    for (let i = 0; i < 1000; i++) {
      promiseArray.push(ldapClient.modify('cn=newPoint5,o=myhost,dc=demoApp,dc=com', changes, control));
    }

    return Promise.all(promiseArray);
  })
  .then(() => {
    const end = process.hrtime(t0);
    console.log('Modifying took: %ds %dms', end[0], end[1] / 1e6);
  })
  .catch((err) => {
    throw err;
  });

