'use strict';

const ldap = require('ldapjs');

const adminClient = ldap.createClient({url: 'ldap://localhost:389'});

const opts = {
  scope: 'sub',
};
const NS_PER_SEC = 1e9;
const t0 = process.hrtime();
adminClient.bind('cn=admin,dc=demoApp,dc=com', 'secret', (err) => {
  if (err) { console.log('something is wrong'); } else {
    adminClient.search('dc=demoApp,dc=com', opts, (err, res) => {

      res.on('searchEntry', (entry) => {
        console.log(`entry:${JSON.stringify(entry.object)}`);
      });

      res.on('end', (result) => {
        console.log(`status: ${result.status}`);
        const end = process.hrtime(t0);
        console.log('Searching took: %ds %dms', end[0], end[1] / 1e6);

      });

    });


  }
});
