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

  beforeEach(() => {
    clientLDAP = new LDAPWrap(hostAddress);
    clientLDAP2 = new LDAPWrap(hostAddress);
  });

  afterEach(() => {});

  it('should bind multiple clients on the same time', () => {
    const init1 = clientLDAP.initialize();
    const init2 = clientLDAP2.initialize();
    const bind1 = clientLDAP.bind(dn, password);
    const bind2 = clientLDAP2.bind(dn2, password2);

    return Promise.all([init1, init2, bind1, bind2]).then((result) => {
      result.forEach((element) => {
        should.deepEqual(
            element, (element == E_STATES.INITIALIZED) ? E_STATES.INITIALIZED :
                                                         E_STATES.BOUND);
      });
    });
  });

});
