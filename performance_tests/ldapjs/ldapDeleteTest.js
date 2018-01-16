'use strict';

const ldap = require('ldapjs');

const adminClient = ldap.createClient({url: 'ldap://localhost:389'});

const entry = {
  cn: ' foo',
  sn: 'bar',
  objectClass: 'person',
};

const t0 = process.hrtime();
let counter = 0;
adminClient.bind('cn=admin,dc=demoApp,dc=com', 'secret', (err) => {
  if (err) { console.log('something is wrong'); } else {

    for (let i = 0; i < 1000; i++) {
      adminClient.del(`${`cn=newPoint${999 - i}`},o=myhost,dc=demoApp,dc=com`, (addError) => {
        if (addError) {
          console.log(addError);
        }
        counter++;
        if (counter === 999) {
          const end = process.hrtime(t0);
          console.log('Deleting took: %ds %dms', end[0], end[1] / 1e6);

        }
      });


    }


  }
});

