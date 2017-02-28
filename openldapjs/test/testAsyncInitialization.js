'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

describe('Testing the async initialization', () => {
  const ldapWrap = new LDAPWrap();

  const E_STATES = {
    ERROR: 0,
    INITIALIZED: 1,
    BOUND: 2,
    UNBOUND: 5,
  };

  beforeEach((next) => {
    next();
  });

  afterEach(() => {
  });

  it('should be INITIALIZED', (next) => {
    const host = 'ldap://10.16.0.194:389';
    ldapWrap.initialize(host)
    .then((result) => {
      should.deepEqual(result, E_STATES.INITIALIZED);
      next();
    });
  });

  it('should be not INITIALIZED', (next) => {
    const host = 'lp://10.16.0.194:389';

    ldapWrap.initialize(host)
    .catch((err) => {
      should.deepEqual(err, E_STATES.ERROR);
      next();
    });
  });

});
