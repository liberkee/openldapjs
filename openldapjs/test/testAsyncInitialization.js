'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const errList = require('./errorList.json');
const StateError = require('../modules/errors/state_error');

describe('Testing the async initialization', () => {

  const host = config.ldapAuthentication.host;
  let ldapWrap;

  beforeEach(() => { ldapWrap = new LDAPWrap(host); });

  afterEach(() => {});

  it('should initialize the connection', () => {
    return ldapWrap.initialize()
      .then((result) => {
        should.deepEqual(result, undefined);
      });
  });

  it('should reject with multiple initialization on same object', () => {
    return ldapWrap.initialize()
      .then(() => {
        return ldapWrap.initialize();
      })
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(StateError, (error) => {
        should.deepEqual(error.message, errList.initErrorMessage);
      });
  });

});
