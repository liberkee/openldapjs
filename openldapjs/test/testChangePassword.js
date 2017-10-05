'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');
const errList = require('./errorlist.json');

describe.only('Testing the ChangePassword operation', () => {

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

  beforeEach(() => {
    /* Create an LDAP connection with a defined user */
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
      .then(() => {
        return ldapAsyncWrap.bind(dn, password);
      });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });

  it('should reject the client is not bounded', () => {
    ldapAsyncWrap.unbind()
      .then(() => {
        return ldapAsyncWrap.changePassword(userDN, oldPassword, newPassword);
      })
      .catch((err) => {
        should.deepEqual(err.message, errList.bindErrorMessage);
      });
  });

  it('should reject if one of the parameters is not string type', () => {
    return ldapAsyncWrap.changePassword(1, oldPassword, newPassword)
      .catch((err) => {
        should.deepEqual(err.message, errList.typeErrorMessage);
        return ldapAsyncWrap.changePassword(userDN, 1, newPassword);
      })
      .catch((err) => {
        should.deepEqual(err.message, errList.typeErrorMessage);
        return ldapAsyncWrap.changePassword(userDN, oldPassword, 1);
      })
      .catch((err) => {
        should.deepEqual(err.message, errList.typeErrorMessage);
      });
  });

  it('should reject if the userDN is not correct ', () => {
    const wrongUser = 'cn=WrongUser,dc=demoApp,dc=com';
    return ldapAsyncWrap.changePassword(wrongUser, oldPassword, newPassword)
      .catch((err) => {
        should.deepEqual(err, errList.unwillingToPerform);
      });
  });

  it('should reject if the oldPassword is not correct ', () => {
    const wrongPassword = 'wrongPassword';
    return ldapAsyncWrap.changePassword(userDN, wrongPassword, newPassword)
      .catch((err) => {
        should.deepEqual(err, errList.unwillingToPerform);
      });
  });

  it('should reject the password if newPassword is empty string', () => {
    return ldapAsyncWrap.changePassword(userDN, oldPassword, '')
      .catch((err) => {
        should.deepEqual(err, errList.unwillingToPerform);
      });
  });

  it('should change the password', () => {
    return ldapAsyncWrap.changePassword(userDN, oldPassword, newPassword)
      .then((res) => {
        should.deepEqual(res, undefined);
      });
  });

});

