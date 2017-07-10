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
  cn: 'foo',
  sn: 'bar',
  email: ['foobar@bla.com','foo2bar@blabla.com'],
  objectClass: 'test'
};

let string = JSON.stringify(entry);


console.log(string);
let bla = Object.keys( entry);

console.log(bla);

for(const key of bla) {
  console.log(entry[key]);
}

//console.log(entry);
