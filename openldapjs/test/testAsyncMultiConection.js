'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');

describe('Testing the async LDAP connection', () => {

  const hostAddress = config.ldapAuthentification.host;
  const dn = config.ldapAuthentification.dnAdmin;
  const password = config.ldapAuthentification.passwordAdmin;

  const dn2 = config.ldapAuthentification.dnUser;
  const password2 = config.ldapAuthentification.passwordUser;

  let clientLDAP = new LDAPWrap(hostAddress);
  let clientLDAP2 = new LDAPWrap(hostAddress);

  const E_STATES = {
    ERROR: 0,
    INITIALIZED: 1,
    BOUND: 2,
    UNBOUND: 5,
  };

  beforeEach((next) => {
    clientLDAP = new LDAPWrap(hostAddress);
    clientLDAP2 = new LDAPWrap(hostAddress);
    next();
  });

  afterEach(() => {
  });

  it('should bind multiple clients on the same time', (next) => {
    const progress = 0;
    clientLDAP.initialize()
    .then(() => {
      clientLDAP2.initialize()
      .then(() => {
        clientLDAP.bind(dn, password)
        .then((result) => {
          should.deepEqual(result, E_STATES.BOUND);
        });
        clientLDAP2.bind(dn2, password2)
        .then((result) => {
          should.deepEqual(result, E_STATES.BOUND);
        });
        next();
      });
    });
  });

});
