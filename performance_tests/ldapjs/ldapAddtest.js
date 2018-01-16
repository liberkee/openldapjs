'use strict';

const ldap = require('ldapjs');

const adminClient = ldap.createClient({url: 'ldap://localhost:389'});

const entry = {
  cn: ' foo',
  sn: 'bar',
  objectClass: 'person',
};

let counter = 0;
const t0 = process.hrtime();
adminClient.bind('cn=admin,dc=demoApp,dc=com', 'secret', (err) => {
  if (err) { console.log('something is wrong'); } else {
    // bound
    for (let i = 0; i < 1000; i++) {
      adminClient.add(`cn=newPoint${i},o=myhost,dc=demoApp,dc=com`, entry, (err) => {
        if (err) {
          console.log(`shit went wrong${err}`);
        }
        counter++;

        if (counter === 999) {
          const end = process.hrtime(t0);
          console.log('Adding took: %ds %dms', end[0], end[1] / 1e6);
        }

      });
    }


  }
});

