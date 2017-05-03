'use strict';
const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');

describe('Testing the async LDAP authentification', () => {
  const hostAddress = 'ldap://10.16.0.194:389';
  const dn = 'cn=admin,dc=demoApp,dc=com';
  const password = 'secret';
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  const attr = 'objectClass';
  const val = 'person';

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    ldapAsyncWrap.initialize()
    .then(() => {
      ldapAsyncWrap.bind(dn, password)
      .then(() => {
        next();
      })
    })
    
  });

  afterEach(() => {
  });

  it('should compare existing attribute', (next) => {
    ldapAsyncWrap.compare(dn, attr, val)
    .then((result) => {
      console.log(result); 
      should.deepEqual(result, true);
      next();
    }) 
    .catch((err) => {
      console.log('!!ERROR = ' + err);
    })
  });


})