'use strict';

//Import the addon function and openLdap libraries
const client = require('./build/Release/binding');

const hostAddress = '10.16.0.194';
const portAddress = 389;
const Host = `ldap://${hostAddress}:${portAddress}`;
const bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
const passwordUser = 'secret';
const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
const searchFilter = '(objectclass=*)';
const DNCompare = 'ou=users,o=myhost,dc=demoApp,dc=com';
const attributeCompare = 'ou';
const valueToCompare = 'users';
const scope = 2; 

function connectSearch(username, password) {
  const initialization = client.initialize(Host);
  if (initialization === false) {
    console.log('The initialization was not ok');
    return;
  }
  console.log('Initialized');
  if (client.bind(username, password) === false) {
    console.log('Username or password ar incorect');
    return;
  }
  console.log('Bound');
  const searchResult = client.search(searchBase, scope, searchFilter);
  console.log(searchResult);
  const compareElement = client.compare(DNCompare, attributeCompare, valueToCompare);
  console.log(compareElement);
  client.unbind();
}

connectSearch(bindDN, passwordUser);

// console.log(initialization);
