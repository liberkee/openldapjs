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

  const E_STATES = {
    CREATED: 0,
    INITIALIZED: 1,
    BOUND: 2,
    UNBOUND: 5,
  };

  beforeEach(() => {
    clientLDAP = new LDAPWrap(host);
    return clientLDAP.initialize();
  });
  afterEach(() => {});

  it('should bind to server', () => {
    return clientLDAP.bind(dn, password).then((result) => {
      should.deepEqual(result, E_STATES.BOUND);
    });
  });

  it('should not bind to server', () => {
    return clientLDAP
        .bind(
            config.ldapCompare.invalidUser, config.ldapCompare.invalidPassword)
        .catch((err) => { should.deepEqual(err, errList.invalidCredentials); });
  });

  it('should unbind from server', () => {
    return clientLDAP.unbind().then(
        (result) => { should.deepEqual(result, E_STATES.UNBOUND); });
  });


});
