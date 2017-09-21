'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');

describe('Testing the async initialization', () => {

  const host = config.ldapAuthentification.host;
  let ldapWrap;

  const E_STATES = {
    ERROR: 0,
    INITIALIZED: 1,
    BOUND: 2,
    UNBOUND: 5,
  };

  beforeEach(() => {
    ldapWrap = new LDAPWrap(host);
  });

  afterEach(() => {});

  it('should be INITIALIZED', () => {
    return ldapWrap.initialize().then((result) => {
      should.deepEqual(result, E_STATES.INITIALIZED);
    });
  });

});
