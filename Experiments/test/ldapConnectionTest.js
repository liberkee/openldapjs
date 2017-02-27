'use strict';

// Import the addon function and openLdap libraries
const client = require('../addonFile/build/Release/binding');
const should = require('should');

// Define the parameters for the search function
const host = 'ldap://10.16.0.194:389';
const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
const searchFilter = '(objectclass=*)';
const scope = 2;

// Define the parameters for the compare
const DNCompare = 'ou=users,o=myhost,dc=demoApp,dc=com';
const attributeCompare = 'ou';
const valueToCompare = 'users';

const stateMachine = {
  failTest: 0,
  init: 1,
  binded: 2,
  search: 3,
  compare: 4,
  unbinded: 5,
};

describe('LdapConnection#client', () => {
  // Create two client to verify the connection
  const myClient = new client.LDAPClient();
  const myClient2 = new client.LDAPClient();
  const myClient3 = new client.LDAPClient();

  it('should create the ld structure for the LDAP client\'s', (next) => {
    const initialization = myClient.initialize(host);
    const initialization2 = myClient2.initialize(host);
    should.deepEqual(stateMachine.init, initialization);
    should.deepEqual(stateMachine.init, initialization2);
    next();
  });

  it('should fail to create the ld structure for LDAP client\'s', (next) => {
    const notGoodHost = '12.102.10.3';
    const initialization3 = myClient3.initialize(notGoodHost);
    should.deepEqual(stateMachine.failTest, initialization3);
    next();
  });

  it('should bind to server for both client', (next) => {
    const bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
    const passwordUser = 'secret';
    const binding = myClient.bind(bindDN, passwordUser);
    should.deepEqual(stateMachine.binded, binding);
    const bindDN2 = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
    const passwordUser2 = 'secret';
    const binding2 = myClient2.bind(bindDN, passwordUser);
    should.deepEqual(stateMachine.binded, binding2);
    next();
  });

  it('should fail the bind for a client', (next) => {
    const initialization3 = myClient3.initialize(host);
    const bindDN = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
    const passwordUser = 'secet';
    const binding = myClient3.bind(bindDN, passwordUser);
    should.deepEqual(stateMachine.failTest, binding);
    next();
  });

  it('should return the search of both client', (next) => {
    const search = myClient.search(searchBase, scope, searchFilter);
    const splitAttr = search.split('stateClient');
    const searchArgument = Number(splitAttr[1]);
    const search2 = myClient2.search(searchBase, scope, searchFilter);
    const splitAttr2 = search.split('stateClient');
    const searchArgument2 = Number(splitAttr[1]);
    should.deepEqual(stateMachine.search, searchArgument);
    should.deepEqual(stateMachine.search, searchArgument2);
    next();
  });


  it('should return an error for search', (next) => {
    const bindDN = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
    const passwordUser = 'secret';
    const searchBaseError = 'dc=demoApp,dc=com';
    const binding = myClient3.bind(bindDN, passwordUser);
    const search3 = myClient3.search(searchBaseError, scope, searchFilter);
    const searchArgument3 = search3;
    should.deepEqual(stateMachine.failTest, searchArgument3);
    next();
  });

  it('should return true for the comparation requestet by client', (next) => {
    const compare = myClient.compare(DNCompare, attributeCompare, valueToCompare);
    should.deepEqual(stateMachine.compare, compare);
    next();
  });

  it('should return false for the comparation requestet by client', (next) => {
    const unvalidValue = 'user';
    const compare = myClient.compare(DNCompare, attributeCompare, unvalidValue);
    should.deepEqual(stateMachine.failTest, compare);
    next();
  });

  it('should unbined the client\'s from the server', (next) => {
    const unbind = myClient.unbind();
    const unbind2 = myClient2.unbind();
    should.deepEqual(stateMachine.unbinded, unbind);
    should.deepEqual(stateMachine.unbinded, unbind2);
    next();
  });

});
