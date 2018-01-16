'use strict';

const ldap = require('ldapjs');

const adminClient = ldap.createClient({url: 'ldap://localhost:389'});


const change = {
  operation: 'replace',
  modification: {
    sn: 'boox',
  },
};
let counter = 0;
const t0 = process.hrtime();
adminClient.bind('cn=admin,dc=demoApp,dc=com', 'secret', (err) => {
  if (err) {
    console.log('something is wrong');
  } else {
    for (let i = 0; i < 1000; i++) {
      adminClient.modify('cn=newPoint5,o=myhost,dc=demoApp,dc=com', change, (err) => {
        if (err) {
          console.log(err);

        }
        counter++;
        if (counter === 999) {
          const end = process.hrtime(t0);
          console.log('Modifying took: %ds %dms', end[0], end[1] / 1e6);
        }

      });
    }
  }
});

