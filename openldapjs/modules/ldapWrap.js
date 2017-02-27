'use strict';

//Import the addon function and openLdap libraries
const client = require('../addonFile/build/Release/binding');

const myClient = new client.LDAPClient();

const hostAddress = '10.16.0.194';
const portAddress = 389;
const Host = `ldap://${hostAddress}:${portAddress}`;
let bindDN = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const passwordUser = 'secret';
const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
const searchFilter = '(objectclass=*)';


const initialization = myClient.initialize(Host);
  if (initialization === 0) {
    console.log('The initialization was not ok');
    return;
  } else {
    const binding = myClient.bind(bindDN,passwordUser);
    let status = 0;
    let error;
    while (status === 0) {
      status = myClient.resultMessage();

      switch(status) {
        case -1: 
          console.log('An error occured');
        return;
        case 0:
        //Do nothing;
        break;
        default:
          error = myClient.errCatch();
          if(error !== 0) {
            let errorMsg = myClient.errMessage(error);
            console.log(errorMsg);
            return;
          }
          console.log('Async bind');
        break;
      }
    }
  }

