'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');

describe('Testing the async initialization', () => {

  const host = config.ldapAuthentication.host;
  let ldapWrap;

  beforeEach(() => { ldapWrap = new LDAPWrap(host); });

  afterEach(() => {});

  it('should  initialize the connection', () => {
    return ldapWrap.initialize().then(
        (result) => { should.deepEqual(result, undefined); });
  });

});
