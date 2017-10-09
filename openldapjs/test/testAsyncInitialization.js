'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const errList = require('./errorlist.json');

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
        return ldapWrap.initialize()
          .then((res) => {
            should.deepEqual(res, errList.initializationErrorMessage);
          });
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.initializationErrorMessage);
      });
  });

});
