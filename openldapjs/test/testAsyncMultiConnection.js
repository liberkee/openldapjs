'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');

describe('Testing the async LDAP connection', () => {

  const hostAddress = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;

  const dn2 = config.ldapAuthentication.dnUser;
  const password2 = config.ldapAuthentication.passwordUser;

  let clientLDAP = new LDAPWrap(hostAddress);
  let clientLDAP2 = new LDAPWrap(hostAddress);

  beforeEach(() => {
    clientLDAP = new LDAPWrap(hostAddress);
    clientLDAP2 = new LDAPWrap(hostAddress);
  });

  afterEach(() => {});

  it('should bind multiple clients at the same time', () => {
    const init1 = clientLDAP.initialize();
    const init2 = clientLDAP2.initialize();
    const bind1 = clientLDAP.bind(dn, password);
    const bind2 = clientLDAP2.bind(dn2, password2);

    return Promise.all([init1, init2, bind1, bind2])
      .then((result) => {
        result.forEach((element) => {
          should.deepEqual(element, undefined);
        }); // better if we check for error( or lack of error) maybe ?
      });
  });

});
