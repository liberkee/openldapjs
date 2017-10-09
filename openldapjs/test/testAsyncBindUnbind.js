'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const errList = require('./errorlist.json');

describe('Testing the async LDAP authentication', () => {
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
    return clientLDAP
      .bind(
        config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        should.deepEqual(err, errList.invalidCredentials);
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
      .catch((error) => {
        should.deepEqual(error.message, errList.bindErrorMessage);
      });
  });

  it('should reject with server error', () => {
    const newClient = new LDAPWrap(host);
    return newClient.unbind()
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((error) => {
        should.deepEqual(error, errList.serverDown);
      });
  });

});
