'use strict'

const LDAPWrap = require('./modules/ldapAsyncWrap.js');
const host = 'ldap://localhost:389';
const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const searchBase = 'dc=demoApp,dc=com';
const password = 'secret';
let clientLDAP = new LDAPWrap(host);


const entry = {
  objectClass: 'inetOrgPerson',
  sn: 'Entryz',
  description: 'Testz',
};

clientLDAP.initialize().then(() => {
  clientLDAP.bind(dnAdmin, password).then(() => {
    for (let i = 2000; i < 1000000; i++) {
      let dn = 'cn=newPointChildMillionaire' + i +
          ',cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com';

      clientLDAP.add(dn, entry, [])
        .catch((err) => {
          throw new Error(err);
        });
      }
    });
  });
         
    
