'use strict';

const LDAPCLIENT = require('../modules/ldapAsyncWrap.js');
const newClient = new LDAPCLIENT();
 
const host = 'ldap://localhost:389';
//const dn = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
//const password = 'secret';

const dnCompare = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const filterCompare = 'description';
const value = 'cghitea@gmail.com';


const dn = 'cn=admin,dc=demoApp,dc=com';
const pass = 'secret';
const searchBase = 'dc=demoApp,dc=com';
const scope = 2;
const filter = '(objectclass=*)';
const pageSize = 100;


const ldap = new LDAPCLIENT(host);
ldap.initialize()
.then((res) => {
  console.log('INIT = ' + res);
  ldap.bind(dn, pass)
  .then((result) => {
    console.log('BIND = ' + result);
    /*ldap.search(searchBase, scope, filter)
    .then((result) => {
      console.log('WITHOUT PAGINATION');
      console.log(result);
    })*/


    ldap.searchWithPagination(searchBase, scope, filter, pageSize)
    .then((result) => {
      console.log('WITH PAGINATION');
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    })
  })
})


/*newClient.initialize(host)
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

    newClient.compare(dnCompare, filterCompare, value)
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
});*/