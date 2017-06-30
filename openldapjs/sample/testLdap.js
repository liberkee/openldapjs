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
const MappingJsonToLdif = require('../modules/mappingJsonToLdif');


const json1 = [];
const attr = {
  type:'',
  vals:[]
};

attr.type='objectClass';
attr.vals.push('foo');
attr.vals.push('boo');
const entry = {
  dn:'',
  modification: {
    type:'',
    vals:[]
  }
};
entry.dn = 'admin';
entry.modification = attr;

json1.push(entry);

// 2
attr.type='objectClass';
attr.vals.push('foo2');
attr.vals.push('boo2');
entry.dn = 'admin2';
entry.modification = attr;

json1.push(entry);




//console.log(json1);



/*const json = {[
  {
    operation: 'replace',
    modification: {
      type: 'cn',
      vals: ['foo', 'bar']
    }
  },
  {
    operation:''
  }
]}*/

const map = new MappingJsonToLdif();
map.changeToLdif(json1)
.then((res) => {
  console.log(res);
})
.catch((err) => {
  console.log(err);
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