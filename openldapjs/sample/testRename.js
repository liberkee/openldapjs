'use strict';

const LDAPCLIENT = require('../modules/ldapAsyncWrap.js');


const host = 'ldap://localhost:389';
const dn = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const password = 'secret';
const base = 'ou=users,o=myhost,dc=demoApp,dc=com';
const scope = 2;
const filter = '(objectclass=*)';
const dnCompare = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const filterCompare = 'description';
const value = 'cghitea@gmail.com';
const newClient = new LDAPCLIENT(host);

const control = [
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

let entry = {objectClass: 'inetOrgPerson', sn: 'Entryz', description: 'Testz'};

newClient.initialize().then(() => {
  newClient.bind('cn=admin,dc=demoApp,dc=com', 'secret').then(() => {
    newClient
        .del(
            'cn=newPoint222,ou=users,o=myhost,dc=demoApp,dc=com',
            control)
        .then((result) => { console.log(result); })
        .catch((err) => { console.log(err.message); });
  });

});
