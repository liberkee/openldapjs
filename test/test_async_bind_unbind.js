'use strict';

const should = require('should');
const LDAPWrap = require('../libs/ldap_async_wrap.js');
const config = require('./config.json');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const StateError = require('../libs/errors/state_error');
const LdapOtherError = require('../libs/errors/ldap_errors/ldap_other_error');
const errorCodes = require('../libs/error_codes');
const errorMessages = require('../libs/messages.json');

describe('Testing the async LDAP bind/unbind', () => {
  const host = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;
  let clientLDAP = new LDAPWrap(host);
  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    clientLDAP = new LDAPWrap(host);
    return clientLDAP.initialize();
  });
  afterEach(() => { });

  it('should not bind to the server using invalid credentials', () => {

    const CustomError = errorHandler(errorCodes.invalidCredentials);
    return clientLDAP
      .bind(
        config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorMessages.ldapBindErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should unbind from the server', () => {
    return clientLDAP.unbind()
      .catch((err) => {
        should.fail('did not expect an error');
      });
  });

  it('should reject if the credential are not correct', () => {
    const newClient = new LDAPWrap(host);
    const CustomError = errorHandler(errorCodes.invalidCredentials);
    return newClient.initialize()
      .then((result) => {
        return newClient.startTLS();
      })
      .then((result) => {
        return newClient.bind(config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword);
      })
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err.constructor.description, CustomError.description);
      })
      .catch(() => {
        should.fail('did not expect generic error');
      });
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
        should.deepEqual(error.message, errorMessages.uninitializedErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject with server error', () => {
    const newClient = new LDAPWrap(host);
    const CustomError = errorHandler(errorCodes.ldapOther);
    return newClient.unbind()
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorMessages.ldapUnbindErrorMessage));
      });
  });

});
