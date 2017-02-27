'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

describe('Testing the async LDAP operation', () => {
  const host = 'ldap://10.16.0.194:389';
  const dn = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';
  const clientLDAP = new LDAPWrap();

  beforeEach((next) => {
    next();
  });
  afterEach(() => {
  });

  it('should be initialized', (next) => {
    clientLDAP.initialize(host)
    .then((result) => {
      should.deepEqual(result, 'Initialization');
      next();
    });
  });
  it('should not be initialized', (next) => {
    const newhost = 'la://10';
    clientLDAP.initialize(newhost)
    .catch((err) => {
      should.deepEqual(err, 'The host is incorect');
      next();
    });
  });
  it('should bind to server', (next) => {
    clientLDAP.initialize(host)
    .then(() => {
      clientLDAP.bind(dn, password)
      .then((result) => {
        should.deepEqual(result, 'Bind succesfuly');
        next();
      });
    });
  });
  it('should not bind to server', (next) => {
    const newDN = 'cn=rmim,ou=users,o=myhost,dc=demoApp,dc=com';
    clientLDAP.initialize(host)
    .then(() => {
      clientLDAP.bind(newDN, password)
      .catch((err) => {
        should.deepEqual(err, 49);
        next();
      });
    });
  });

});
