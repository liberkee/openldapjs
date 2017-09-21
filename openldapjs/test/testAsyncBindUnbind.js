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

  beforeEach(() => {
    clientLDAP = new LDAPWrap(host);
    return clientLDAP.initialize();
  });
  afterEach(() => {
  });

  it('should bind to server', () => {
    return clientLDAP.bind(dn, password)
    .then((result) => {
      should.deepEqual(result, E_STATES.BOUND);
    });
  });

  it('should not bind to server', () => {
    return clientLDAP.bind(config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword)
    .catch((err) => {
      should.deepEqual(err.message, invalidCredentials);
    });
  });

  it('should unbind from server', () => {
    return clientLDAP.unbind()
    .then((result) => {
      should.deepEqual(result, E_STATES.UNBOUND);
    });
  });


});
