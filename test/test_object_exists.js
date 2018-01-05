'use strict';

const LdapAsyncWrap = require('../libs/ldap_async_wrap.js');
const should = require('should');
const config = require('./config.json');
const errorList = require('./error_list.json');
const StateError = require('../libs/errors/state_error');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;

describe('Testing the objectExists function', () => {
  const hostAddress = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentication.host);

    return ldapAsyncWrap.initialize()
      .then(() => { return ldapAsyncWrap.startTLS(pathToCert); })
      .then(() => { return ldapAsyncWrap.bind(dn, password); });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });


  it('should return true if the object exists', () => {
    return ldapAsyncWrap.objectExists(dn)
      .then((res) => {
        res.should.be.true();
      });
  });

  it('should return false if the object don\'t exist', () => {
    const wrongDN = 'cn=wrong';
    return ldapAsyncWrap.objectExists(wrongDN)
      .then((res) => {
        res.should.be.false();
      });
  });

});
