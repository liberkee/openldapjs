'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

describe('Testing the async initialization', () => {

  beforeEach((next) => {
    next();
  });

  afterEach(() => {
  });

  it('should be INITIALIZED', (next) => {
    const host = 'ldap://10.16.0.194:389';
    const ldapWrap = new LDAPWrap();

    ldapWrap.initialize(host)
    .then((result) => {
      console.log(result);
      should.deepEqual(result, 'Initialization');
      next();
    })
  });

   it('should be not INITIALIZED', (next) => {
    const host = 'sad';
    const ldapWrap = new LDAPWrap();

    ldapWrap.initialize(host)
    .catch((err) => {
      should.deepEqual(err, 'The host is incorect');
      next();
    });
  });

});
