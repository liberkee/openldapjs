'use strict';

const LDAP = require('../libs/ldap_async_wrap.js');
const should = require('should');
const config = require('./config');
const Promise = require('bluebird');
const errorList = require('./error_list');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const StateError = require('../libs/errors/state_error');
const ValidationError = require('../libs/errors/validation_error');


describe('Testing the async LDAP extended operation', () => {

  let clientLDAP = new LDAP(config.ldapAuthentication.host);
  let clientLDAP2 = new LDAP(config.ldapAuthentication.host);

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    clientLDAP = new LDAP(config.ldapAuthentication.host);
    clientLDAP2 = new LDAP(config.ldapAuthentication.host);
    const init = clientLDAP.initialize();
    const init2 = clientLDAP2.initialize();

    return Promise.all([init, init2])
      .then(() => {
        const bind = clientLDAP.bind(
          config.ldapAuthentication.dnAdmin,
          config.ldapAuthentication.passwordAdmin);

        return Promise.all([bind]);
      });
  });

  afterEach(() => {
    const unbind1 = clientLDAP.unbind();
    const unbind2 = clientLDAP2.unbind();

    return Promise.all([unbind1, unbind2]);
  });

  it('should return the string of you DN entry', () => {
    return clientLDAP.extendedOperation(config.ldapExtendedOperation.oid.whoAmI)
      .then((result) => {
        const resultVal = result.split(':');
        const dnVal = resultVal[1];
        dnVal.should.be.deepEqual(config.ldapAuthentication.dnAdmin);
      });
  });

  /* For anonym users the extend operation will return an empty string */
  it('should return anonym if the user don\'t bind to server', () => {
    return clientLDAP2.extendedOperation(config.ldapExtendedOperation.oid.whoAmI)
      .then((result) => {
        const anonymUser = '';
        result.should.be.deepEqual(anonymUser);
      });
  });

  it('should start a TLS communication with LDAP server', () => {
    return clientLDAP2.extendedOperation(config.ldapExtendedOperation.oid.startTLS)
      .then((result) => {
        const successStart = 0;
        result.should.be.deepEqual(successStart);
      });
  });

  it('should reject if the server don\'t support the extended operation', () => {
    const userDN = `dn:${config.ldapAuthentication.dnUser}`;
    const CustomError = errorHandler(errorList.ldapProtocolError);

    return clientLDAP2.extendedOperation(config.ldapExtendedOperation.oid.refresh, userDN)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapExtendedOperationMessage));
      })
      .catch(() => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if you don\'t provide a good message ID for the cancel operation', () => {
    const CustomError = errorHandler(errorList.LdapNoSuchOperation);
    const msgID = 10;

    return clientLDAP.extendedOperation(config.ldapExtendedOperation.oid.cancelRequest, msgID)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapExtendedOperationMessage));
      })
      .catch(() => {
        should.fail('did not expect generic error');
      });
  });

  it('should change a password of a specific user', () => {
    return clientLDAP.extendedOperation(config.ldapExtendedOperation.oid.changePassword,
      [config.ldapChangePassword.user,
        config.ldapChangePassword.oldPasswd,
        config.ldapChangePassword.newPasswd])
      .then((result) => {
        const successStart = 0;
        result.should.be.deepEqual(successStart);
      });
  });

  it('should reject if the old password is not correct', () => {
    const CustomError = errorHandler(errorList.unwillingToPerform);
    return clientLDAP.extendedOperation(config.ldapExtendedOperation.oid.changePassword,
      [config.ldapChangePassword.user,
        'Wrong password',
        config.ldapChangePassword.newPasswd])
      .then((result) => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapExtendedOperationMessage));
      })
      .catch(() => {
        should.fail('did not expect generic error');
      });
  });

});
