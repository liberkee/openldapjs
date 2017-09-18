'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');

describe('Testing the async LDAP authentification', () => {
  const host = config.ldapAuthentification.host;  
  const dn = config.ldapAuthentification.dnAdmin;
  const password = config.ldapAuthentification.passwordAdmin;
  let clientLDAP = new LDAPWrap(host);

  const invalidCredentials = '49';

  const E_STATES = {
    ERROR: 0,
    INITIALIZED: 1,
    BOUND: 2,
    UNBOUND: 5,
  };

  beforeEach((next) => {
    clientLDAP = new LDAPWrap(host);
    clientLDAP.initialize()
    .then(() => {
      next();
    });
  });
  afterEach(() => {
  });

  it('should bind to server', (next) => {
    clientLDAP.bind(dn, password)
    .then((result) => {
      should.deepEqual(result, E_STATES.BOUND);
      next();
    });
  });

  it('should not bind to server', (next) => {
    clientLDAP.bind(config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword)
    .catch((err) => {
      // Give the specific error not the state of the operation
      should.deepEqual(err.message, invalidCredentials);
      next();
    });
  });

  it('should unbind from server', (next) => {
    clientLDAP.unbind()
    .then((result) => {
      should.deepEqual(result, E_STATES.UNBOUND);
      next();
    });
  });


});
