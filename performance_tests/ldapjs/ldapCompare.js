'use strict';

const ldap = require('ldapjs');

const adminClient = ldap.createClient({url: 'ldap://localhost:389'});

const opts = {
  scope: 'sub',
};

let counter = 0;
const t0 = process.hrtime();
adminClient.bind('cn=admin,dc=demoApp,dc=com', 'secret', (err) => {
  if (err) {
    console.log('something is wrong');
  } else {
    for (let i = 0; i < 1000; i++) {
      adminClient.compare('cn=admin,dc=demoApp,dc=com', 'objectClass', 'simpleSecurityObject', (err, matched) => {
        if (err) {
          throw err;
        }
        counter++;
        if (counter === 999) {
          const end = process.hrtime(t0);
          console.log('Comparing took: %ds %dms', end[0], end[1] / 1e6);
        }

      });
    }
  }
});

