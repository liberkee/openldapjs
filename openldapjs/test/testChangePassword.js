'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');
const errList = require('./errorlist.json');

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

  beforeEach(() => {
    /* Create an LDAP connection with a defined user */
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
      .then(() => {
        return ldapAsyncWrap.bind(dn, password);
      });
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
      .catch((err) => {
        should.deepEqual(err.message, errList.bindErrorMessage);
      });
  });


  it('should reject if userDN is not string type', () => {
    return ldapAsyncWrap.changePassword(1, oldPassword, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        should.deepEqual(err.message, errList.typeErrorMessage);
      });
  });

  it('should reject if oldPassword is not string type', () => {
    return ldapAsyncWrap.changePassword(userDN, 1, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        should.deepEqual(err.message, errList.typeErrorMessage);
      });
  });

  it('should reject if newPassword is not string type', () => {
    return ldapAsyncWrap.changePassword(userDN, oldPassword, 1)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        should.deepEqual(err.message, errList.typeErrorMessage);
      });
  });


  it('should reject if the userDN is not defined as an entry in LDAP database ', () => {
    const wrongUser = 'cn=WrongUser,dc=demoApp,dc=com';
    return ldapAsyncWrap.changePassword(wrongUser, oldPassword, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        should.deepEqual(err, errList.unwillingToPerform);
      });
  });

  it('should reject if the oldPassword is not correct ', () => {
    const wrongPassword = 'wrongPassword';
    return ldapAsyncWrap.changePassword(userDN, wrongPassword, newPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        should.deepEqual(err, errList.unwillingToPerform);
      });
  });

  it('should reject the password if newPassword is empty string', () => {
    return ldapAsyncWrap.changePassword(userDN, oldPassword, '')
      .then(() => {
        should.fail('Didn\'t expect success');
      })
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

