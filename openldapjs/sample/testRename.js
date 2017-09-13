'use strict';

const LDAPWrap = require('../modules/ldapAsyncWrap.js');

const clientLDAP = new LDAPWrap('ldap://localhost:386');

const dnUser = 'cn=admin,dc=demoApp,dc=com';
const password = 'secret';
const dnChange = 'cn=cosming,o=myhost,dc=demoApp,dc=com';
const newrdn = 'cn=cghitea';
const newparent = 'ou=users,o=myhost,dc=demoApp,dc=com';

const controls = [
  {
    oid: 'preread',
    value: ['entryCSN'],
    iscritical: false,
  },
  {
    oid: 'postread',
    value: ['entryCSN'],
    iscritical: false,
  },
];

clientLDAP.initialize()
.then(() => {
  clientLDAP.bind(dnUser, password)
  .then(() => {
    clientLDAP.rename(dnChange, newrdn, newparent, controls)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
  });
});
