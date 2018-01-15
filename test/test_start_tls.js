'use strict';

const should = require('should');
const LDAPWrap = require('../libs/ldap_async_wrap.js');
const config = require('./config.json');
const errorCodes = require('./error_codes.json');
const StateError = require('../libs/errors/state_error');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const errorMessages = require('../libs/messages.json');

describe('Testing the LDAP start TLS routine', () => {

  const host = config.ldapAuthentication.host;
  let adminLDAP = new LDAPWrap(host);

  const pathFileToCert = config.ldapAuthentication.pathFileToCert;
  beforeEach(() => {
    adminLDAP = new LDAPWrap(host);

    return adminLDAP.initialize();
  });

  afterEach(() => {
    return adminLDAP.unbind();
  });

  /* The TLS test should run separated */
  it('should reject if the state is not Initialized', () => {
    return adminLDAP.unbind()
      .then(() => {
        return adminLDAP.startTLS(pathFileToCert);
      })
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(StateError, (error) => {
        should.deepEqual(error.message, errorMessages.initErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should start a TLS communication using the default certificate if the path is wrong', () => {
    const CustomError = errorHandler(errorCodes.connectionError);
    const wrongCred = '/wrong/cred.pam';
    return adminLDAP.startTLS(wrongCred)
      .catch(() => {
        should.fail('did not expect an error');
      });
  });

  it('should start a TLS communication using the server certificate', () => {
    return adminLDAP.startTLS()
      .catch((err) => {
        should.fail('did not expect an error');
      });
  });

  it('should start a TLS communication using the full path file to the certificate', () => {
    return adminLDAP.startTLS(pathFileToCert)
      .catch(() => {
        should.fail('did not expect an error');
      });
  });

});
