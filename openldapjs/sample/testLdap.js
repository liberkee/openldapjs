'use strict';

//Import the addon function and openLdap libraries
const client = require('../addonFile/build/Release/binding');
const JSONmap = require('../modules/mappingJsonObject/mappingStringJson.js');

const myClient = new client.LDAPClient();
const JSONStruct = new JSONmap();

const hostAddress = '10.16.0.194';
const portAddress = 389;
const Host = `ldap://${hostAddress}:${portAddress}`;
let bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
const passwordUser = 'secret';
const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
const searchFilter = '(objectclass=*)';
const scope = 2;

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
   const search = myClient.search(searchBase,scope,searchFilter);
   //console.log(search);
   JSONStruct.stringToJSONwithNewInstance(search)
   .then((result) => {
       console.log(result.entry[1].attribute);
   })
   .catch((err) => {
       console.log(err);
   })
}

