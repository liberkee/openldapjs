'use strict';

const LDAPCLIENT = require('../modules/ldapAsyncWrap.js');
const newClient = new LDAPCLIENT();
 
const host = 'ldap://localhost:389';
const dn = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const password = 'secret';
const base = 'ou=users,o=myhost,dc=demoApp,dc=com';
const scope = 2;
const filter = '(objectclass=*)';
const dnCompare = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const filterCompare = 'description';
const value = 'cghitea@gmail.com';



newClient.initialize(host)
.then((result) => {
  //console.log(result);
  newClient.bind("cn=admin,dc=demoApp,dc=com",password)
  .then((result) => {
    //console.log(result);
    newClient.del("ou=template2,dc=demoApp,dc=com",[])
    .then((result) => {
      console.log("delete result is:" + result);
    })
    .catch((err) => {
      console.log('xx='+err);
    });
/*
    newClient.compare(dnCompare, filterCompare, value)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });*/
  })
  .catch((err) => {
    console.log(err);
  });
})
.catch((err) => {
  console.log(err); 
});
 