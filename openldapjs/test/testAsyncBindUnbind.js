'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

describe('Testing the async LDAP authentification', () => {
  const host = 'ldap://10.16.0.194:389';
  const dn = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';
  const clientLDAP = new LDAPWrap();

  const E_STATES = {
    ERROR: 0,
    INITIALIZED: 1,
    BOUND: 2,
    UNBOUND: 5,
  };

  beforeEach(
      (next) => { clientLDAP.initialize(host).then(() => { next(); }); });
  afterEach(() => {});

  it('should bind to server', (next) => {
    const progress = 0;
    clientLDAP.bind(dn, password).then((result) => {
      should.deepEqual(result, E_STATES.BOUND);
      next();
    });
  });

  it('should not bind to server', (next) => {
    const newDN = 'cn=rmim,ou=users,o=myhost,dc=demoApp,dc=com';
    clientLDAP.bind(newDN, password).catch((err) => {
      // Give the specific error not the state of the operation
      should.deepEqual(err, 49);
      next();
    });
  });

  it('should unbind from server', (next) => {
    clientLDAP.unbind().then((result) => {
      should.deepEqual(result, E_STATES.UNBOUND);
      next();
    });
  });

  it('should return error for uninitialized', (next) => {
    clientLDAP.unbind().then(() => {
      // I will repet the operation for test porpes
      clientLDAP.unbind().catch((err) => {
        should.deepEqual(err, E_STATES.ERROR);
        next();
      });
    });
  });

});
