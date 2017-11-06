'use strict';

const should = require('should');
const LDAPWrap = require('../libs/ldap_async_wrap.js');
const config = require('./config.json');
const errorList = require('./error_list.json');
const StateError = require('../libs/errors/state_error');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;

describe('Testing the LDAP start TLS routine', () => {

  const host = config.ldapAuthentication.host;
  let adminLDAP = new LDAPWrap(host);

  const pathFileToCert = config.ldapAuthentication.pathFileToCert;
  const pathToCert = config.ldapAuthentication.pathToCert;
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
        return adminLDAP.startTLS(pathToCert);
      })
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(StateError, (error) => {
        should.deepEqual(error.message, errorList.initErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should reject if the path file doesn\'t exist', () => {
    const CustomError = errorHandler(errorList.connectionError);
    const wrongCred = '/wrong/cred.pam';
    return adminLDAP.startTLS(wrongCred)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorList.ldapStartTlsErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should reject if there are no certificate in the specified directory', () => {
    const wrongCred = '/etc';
    const CustomError = errorHandler(errorList.connectionError);
    return adminLDAP.startTLS(wrongCred)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorList.ldapStartTlsErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should start a TLS communication using the full path file to the certificate', () => {
    return adminLDAP.startTLS(pathFileToCert)
      .catch(() => {
        should.fail('did not expect an error');
      });
  });

  it('should start a TLS communication using just the directory of the certificate', () => {
    return adminLDAP.startTLS(pathToCert)
      .catch(() => {
        should.fail('did not expect an error');
      });
  });

});
