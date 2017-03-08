'use strict';

const LDAPCLIENT = require('./modules/ldapAsyncWrap.js');
const newClient = new LDAPCLIENT();
 
const host = 'ldap://localhost:389';
const dn = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
const password = 'secret';
const base = 'ou=users,o=myhost,dc=demoApp,dc=com';
const scope = 2;
const filter = '(objectclass=*)';

newClient.initialize(host)
.then((result) => {
  console.log(result);
  newClient.bind(dn,password)
  .then((result) => {
    console.log(result);
    newClient.search(base, scope, filter)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
})
.catch((err) => {
  console.log(err);
});