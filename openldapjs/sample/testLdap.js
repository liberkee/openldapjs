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



newClient.initialize()
.then((result) => {
  //console.log(result);
  newClient.bind("cn=admin,dc=demoApp,dc=com",password)
  .then((result) => {
    //console.log(result);
    newClient.del("ou=template3,dc=demoApp,dc=com",[])
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
    console.log('binding error'+err);
  });
})
.catch((err) => {
  console.log('initialize error'+err); 
});
 