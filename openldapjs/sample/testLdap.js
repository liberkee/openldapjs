'use strict';

//Import the addon function and openLdap libraries
const client = require('../addonFile/build/Release/binding');
const JSONmap = require('../modules/mappingJsonObject/mappingStringJson.js');

const myClient = new client.LDAPClient();
const JSONStruct = new JSONmap();

const hostAddress = 'localhost';
const portAddress = 389;
const Host = `ldap://${hostAddress}:${portAddress}`;
let bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
const passwordUser = 'secret';
const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
const searchFilter = '(objectclass=*)';
const scope = 2;
const ldapSearch = '\ndn:cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:person\ncn:cghitea\nsn:Ghitea Cosmin\ndescription:cghitea@gmail.com\nseeAlso:cn=T1\nseeAlso:cn=T3\nseeAlso:cn=HTML\ncn:Nimsoc\n\n';
const initialization = myClient.initialize(Host);
if (initialization === 0) {
    console.log('The initialization was not ok');
    return;
}
else {
    const binding = myClient.bind(bindDN,passwordUser);
    if (binding === 0 || binding === false) {
      console.log('The binding was not ok');
      return;
    }
   let search = myClient.search(searchBase,scope,searchFilter);
   JSONStruct.stringLDAPtoJSON(ldapSearch)
   .then((result) => {
       console.log(JSON.stringify(result));
   })
   .catch((err) => {
       console.log(err);
   })
}