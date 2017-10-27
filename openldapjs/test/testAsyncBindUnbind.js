'use strict';

const should = require('should');
const LDAPWrap = require('../libs/ldapAsyncWrap.js');
const config = require('./config.json');
const errorList = require('./errorList.json');
const errorHandler = require('../libs/errors/error_dispenser');
const StateError = require('../libs/errors/state_error');
const LdapOtherError = require('../libs/errors/ldap_errors/ldap_other_error');

describe('Testing the async LDAP bind/unbind', () => {
  const host = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;
  let clientLDAP = new LDAPWrap(host);

  beforeEach(() => {
    clientLDAP = new LDAPWrap(host);
    return clientLDAP.initialize();
  });
  afterEach(() => {});

  it('should bind to the server with valid credentials', () => {
    return clientLDAP.bind(dn, password)
      .then((result) => {
        should.deepEqual(result, undefined);
      });
  });

  it('should not bind to the server using invalid credentials', () => {

    const CustomError = errorHandler(errorList.invalidCredentials);
    return clientLDAP
      .bind(
        config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapBindErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should unbind from the server', () => {
    return clientLDAP.unbind()
      .then(
        (result) => { should.deepEqual(result, undefined); });
  });

  it('should reject if the client is not initialized', () => {
    return clientLDAP.unbind()
      .then(() => {
        return clientLDAP.bind(
          config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword);
      })
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(StateError, (error) => {
        should.deepEqual(error.message, errorList.uninitializedErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject with server error', () => {
    const newClient = new LDAPWrap(host);
    return newClient.unbind()
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(LdapOtherError, (error) => {
        should.deepEqual(error.message, errorList.ldapUnbindErrorMessage);
      });
  });

});
