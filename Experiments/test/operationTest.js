'use strict';

const client = require('../addonFile/build/Release/binding');
const should = require('should');


describe('LdapOperation#client', () => {

  const host = 'ldap://10.16.0.194:389';
  const userDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
  const userPass = 'secret';

  const operationState = {
    error: 0,
    search: 3,
    compare: 4,
  };

  const myClient = new client.LDAPClient();

  beforeEach((next) => {
    myClient.initialize(host);
    myClient.bind(userDN, userPass);
    next();
  });

  afterEach(() => {
    myClient.unbind();
  });

  it('should return the request search', (next) => {
    const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
    const scope = 2; // all the sub-entry
    const searchFilter = 'objectclass=person';

    const searchReq = myClient.search(searchBase, scope, searchFilter);
    const messageSplit = searchReq.split('stateClient');
    const searchState = Number(messageSplit[1]);

    should.deepEqual(operationState.search, searchState);
    next();
  });

  it('should return an error the request search', (next) => {
    const searchBase = 'dc=demoApp,dc=com'; // Not autorized acces
    const scope = 2; // all the sub-entry
    const searchFilter = 'objectclass=person';

    const searchReq = myClient.search(searchBase, scope, searchFilter);

    should.deepEqual(operationState.error, searchReq);
    next();
  });

  it('should return true after comparation request', (next) => {
    const compareDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
    const compareAttr = 'description';
    const compareValue = 'rmaxim@gmail.com';

    const compareReq = myClient.compare(compareDN, compareAttr, compareValue);
    should.deepEqual(operationState.compare, compareReq);
    next();
  });

  it('should return false after comparation request', (next) => {
    const compareDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
    const compareAttr = 'description';
    const compareValue = 'rmaxim@yahoo.com';

    const compareReq = myClient.compare(compareDN, compareAttr, compareValue);
    should.deepEqual(operationState.error, compareReq);
    next();
  });
});
