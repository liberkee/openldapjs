'use strict';

const LDAP = require('./index').Client;

const errorHandler = require('./index').errorHandler;

const adminClient = new LDAP('ldap://localhost:389');

const preRead = '1.3.6.1.1.13.1';
const postRead = '1.3.6.1.1.13.2';
const changes = {
  op: 'replace',
  attr: 'sn',
  vals: ['New Address, nr 23'],

};

const control = [
  {
    oid: 'preread', // oid that identifies the extended op
    value: ['cn', 'sn'], // array of server response you want before the modify
    isCritical: false, // whether or not the modify should fail if the required response can not be retrieved 
  },
  {
    oid: 'postread',
    value: ['objectClass', 'sn'],
    isCritical: true,
  },
];

adminClient.initialize()
  .then(() => {
    return adminClient.bind('cn=admin,dc=demoApp,dc=com', 'secret');
  })
  .then(() => {
    return adminClient.search('dc=demoApp,dc=com', 'SUBTREE');
  })
  .then((result) => {
    // console.log(result);
    return adminClient.modify('cn=newPoint999,o=myhost,dc=demoApp,dc=com', changes, control);
  })
  .then((result) => {
    console.log(result);
  });

const ErrorClass = errorHandler(50);
const newError = new ErrorClass('bla');

console.log(newError.code);
