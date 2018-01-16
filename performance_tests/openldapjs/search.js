'use strict';

const Ldap = require('../../index').Client;

const adminClient = new Ldap('ldap://localhost:389');

const t0 = process.hrtime();
adminClient.initialize()
  .then(() => {
    return adminClient.bind('cn=admin,dc=demoApp,dc=com', 'secret');
  })
  .then(() => {
    return adminClient.search('dc=demoApp,dc=com', 'SUBTREE', 'objectClass=*');
  })
  .then((result) => {
    console.log(result);
    const end = process.hrtime(t0);
    console.log('Searching took: %ds %dms', end[0], end[1] / 1e6);

  });
