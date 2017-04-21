'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

describe('Testing the async LDAP connection', () => {
  const host = 'ldap://10.16.0.194:389';

  const dn = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';

  const dn2 = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const password2 = 'secret';

  const clientLDAP = new LDAPWrap();
  const clientLDAP2 = new LDAPWrap();

  const E_STATES = {
    ERROR: 0,
    INITIALIZED: 1,
    BOUND: 2,
    UNBOUND: 5,
  };

  beforeEach((next) => {
    next();
  });

  afterEach(() => {
  });

  it('should bind multiple clients on the same time', (next) => {
    const progress = 0;
    clientLDAP.initialize(host)
    .then(() => {
      clientLDAP2.initialize(host)
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
