'use strict';

const should = require('should');

// Require the library that is used for the test
const client = require('../addonFile/build/Release/binding.node');
const JSONmap = require('../modules/mappingJsonObject/mappingStringJson.js');

// Define the parameters for the search function
const host = 'ldap://localhost:389';

const bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
const passwordUser = 'secret';

const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
const searchFilter = '(objectclass=*)';
const scope = 2;

describe('String to JSON#searchTest', () => {
  const testClient = new client.LDAPClient();
  const JSONStruct = new JSONmap();
  let searchResult;

  beforeEach((next) => {
    // Create a connection to LDAP server and require to performe a search
    testClient.initialize(host);
    testClient.bind(bindDN, passwordUser);
    searchResult = testClient.search(searchBase, scope, searchFilter);
    next();
  });

  afterEach(() => {
    testClient.unbind();
  });

  it('should return the string as JSON', (next) => {
    JSONStruct.stringLDAPtoJSON(searchResult)
    .then((result) => {
      const JSONobjecttest = [{
        dn: 'ou=users,o=myhost,dc=demoApp,dc=com',
        attribute: [
          {type: 'objectClass', value: ['organizationalUnit']},
          {type: 'ou', value: ['users']},
        ],
      }];
      const shouldString = JSON.stringify(JSONobjecttest[0]);
      const resultString = JSON.stringify(result.entry[0]);

      should.equal(shouldString, resultString);
      next();
    });
  });

  it('should return an error if there is a number', (next) => {
    JSONStruct.stringLDAPtoJSON(1234)
    .catch((err) => {
      should.deepEqual(err.message, 'Must be a string');
      next();
    });
  });

  it('should return an error if string is null', (next) => {
    JSONStruct.stringLDAPtoJSON(null)
    .catch((err) => {
      should.deepEqual(err.message, 'The string is null');
      next();
    });
  });

  it('should return an error if string is undefined', (next) => {
    JSONStruct.stringLDAPtoJSON(undefined)
    .catch((err) => {
      should.deepEqual(err.message, 'The string is undefined');
      next();
    });
  });

  it('should return an error if string is empty', (next) => {
    JSONStruct.stringLDAPtoJSON('')
    .catch((err) => {
      should.deepEqual(err.message, 'The string is empty');
      next();
    });
  });

  it('should return an error if is not a LDIF structure', (next) => {
    JSONStruct.stringLDAPtoJSON('A string')
    .catch((err) => {
      should.deepEqual(err.message, 'The string is not a LDAP structure');
      next();
    });
  });

});
