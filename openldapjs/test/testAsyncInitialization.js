'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

describe('Testing the async initialization', () => {
  const ldapWrap = new LDAPWrap();

  beforeEach((next) => {
    next();
  });

  afterEach(() => {
  });

  it('should be INITIALIZED', (next) => {
    const host = 'ldap://10.16.0.194:389';
    ldapWrap.initialize(host)
    .then((result) => {
      should.deepEqual(result, 'Initialization');
      next();
    });
  });

   it('should be not INITIALIZED', (next) => {
    const host = 'lp://10.16.0.194:389';

    ldapWrap.initialize(host)
    .catch((err) => {
      should.deepEqual(err, 'The host is incorect');
      next();
    });
  });

});
