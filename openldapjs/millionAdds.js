'use strict'

    const LDAPWrap = require('./modules/ldapAsyncWrap.js');
const host = 'ldap://localhost:389';
const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const searchBase = 'dc=demoApp,dc=com';
const password = 'secret';
const async = require('async');
let clientLDAP = new LDAPWrap(host);
const Promise = require('bluebird');


const entry = {
  objectClass: 'inetOrgPerson',
  sn: 'Entryz',
  description: 'Testz',
};

clientLDAP.initialize().then(() => {
  clientLDAP.bind(dnAdmin, password).then(() => {
    let s = [];
    for (let i = 0; i < 600000; i++) {
      let dn = 'cn=newPointChildMillionaire' + i +
          ',cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com';
      s.push(dn);
    }
    Promise.reduce(s,(t, d)=>{
      return clientLDAP.add(d, entry, [])
      .then( () => {
        console.log('lol',d);
      }).catch( (err)=> {
        console.log('bad lol',err);
      });
      
    });
  });
});
