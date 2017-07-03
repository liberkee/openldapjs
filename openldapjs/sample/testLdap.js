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



const jsonToParse = {
  entries: [
    {
      operation: 'add',
      modification: {
        type: 'objectClass',
        vals: ['access1', 'access2']
      }
    },
    {
      operation: 'delete',
      modification: {
        type: 'objectClass',
      }
    },
    {
      operation: 'replace',
      modification: {
        type: 'anotherObjectClass',
        vals: ['noAccess1', 'noAccess2']
      }
    }
  ]
}


const map = new MappingJsonToLdif();
map.modifyToLdif(jsonToParse)
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