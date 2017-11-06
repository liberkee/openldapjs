'use strict';

const LdapAsyncWrap = require('../libs/ldap_async_wrap.js');
const should = require('should');
const config = require('./config.json');
const errorList = require('./error_list.json');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const StateError = require('../libs/errors/state_error');

describe('Testing the ChangePassword operation', () => {

  /* Create the class for connecting to he LDAP server */
  const hostAddress = config.ldapAuthentication.host;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);
  /* Connect with a user */
  const dn = config.ldapAuthentication.dnUser;
  const password = config.ldapAuthentication.passwordUser;

  /* The parameter required for changing the password */
  const userDN = config.ldapChangePassword.user;
  const oldPassword = config.ldapChangePassword.oldPasswd;
  const newPassword = config.ldapChangePassword.newPasswd;

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    /* Create an LDAP connection with a defined user */
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
      .then(() => { return ldapAsyncWrap.startTLS(pathToCert); })
      .then(() => { return ldapAsyncWrap.bind(dn, password); });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });

  it('should reject the client is not bound', () => {
    ldapAsyncWrap.unbind()
      .then(() => {
        return ldapAsyncWrap.changePassword(userDN, oldPassword, newPassword);
      })
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(StateError, (err) => {
        should.deepEqual(err.message, errorList.bindErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });


  it('should reject if userDN is not string type', () => {
    return ldapAsyncWrap.changePassword(1, oldPassword, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(TypeError, (err) => {
        should.deepEqual(err.message, errorList.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if oldPassword is not string type', () => {
    return ldapAsyncWrap.changePassword(userDN, 1, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(TypeError, (err) => {
        should.deepEqual(err.message, errorList.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newPassword is not string type', () => {
    return ldapAsyncWrap.changePassword(userDN, oldPassword, 1)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(TypeError, (err) => {
        should.deepEqual(err.message, errorList.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });


  it('should reject if the userDN is not defined as an entry in LDAP database ', () => {
    const wrongUser = 'cn=WrongUser,dc=demoApp,dc=com';
    const CustomError = errorHandler(53);
    return ldapAsyncWrap.changePassword(wrongUser, oldPassword, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapChangePasswordErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if the oldPassword is not correct ', () => {
    const CustomError = errorHandler(53);
    const wrongPassword = 'wrongPassword';
    return ldapAsyncWrap.changePassword(userDN, wrongPassword, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapChangePasswordErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newPassword is  an empty string', () => {
    const CustomError = errorHandler(53);
    return ldapAsyncWrap.changePassword(userDN, oldPassword, '')
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapChangePasswordErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should change the password', () => {
    return ldapAsyncWrap.changePassword(userDN, oldPassword, newPassword)
      .catch(() => {
        should.fail('did not expect an error');
      });
  });

});

