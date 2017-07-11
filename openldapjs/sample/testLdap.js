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



let entry = {
  objectClass: 'inetOrgPersonz',
  cn: 'Test Entryz',
  sn: 'Entryz',
  givenName: 'Testz',
  ou: 'users2z'




};

newClient.initialize()
  .then(() => {
    newClient.bind('cn=admin,dc=demoApp,dc=com', 'secret')
      .then(() => {

        newClient.add('ou=users,o=myhost,dc=demoApp,dc=com', entry, [])
          .then((result) => {

          }).catch((err) => {
            console.log(err);
          })
      })

  })


//console.log(entry);
