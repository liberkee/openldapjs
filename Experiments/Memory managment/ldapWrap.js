'use strict';

//Import the addon function and openLdap libraries
const client = require('./build/Release/binding');

const myClient = new client.LDAPClient();
const myClient2 = new client.LDAPClient();

const hostAddress = '10.16.0.194';
const portAddress = 389;
const Host = `ldap://${hostAddress}:${portAddress}`;

const initialization = myClient.initialize(Host);
  if (initialization === false) {
    console.log('The initialization was not ok');
    return;
}
console.log('Client 1:' + myClient.getState() + '\nClient 2:' + myClient2.getState());