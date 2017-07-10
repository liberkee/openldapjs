'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');

describe('Testing the async LDAP delete operation', () => {

  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';

  let clientLDAP = new LDAP(host);

  beforeEach((next) => {
    clientLDAP = new LDAP(host);

    clientLDAP.initialize()
      .then(() => {
        clientLDAP.bind(dnUser, password)
          .then(() => {
            next();
          });
      });
  });
  afterEach(() => {
    clientLDAP.unbind()
      .then(() => {

      });
  });

  //trying to delete with an invalid dn syntax => ldap error code 34
  it('should reject the request with invalidDN error code', (next) => {
    clientLDAP.del('garbage')
      .catch((err) => {
        err.message.should.be.deepEqual('34');
        next();
      });
  });

  it('should reject the request with insufficient access error code', (next) => {
    clientLDAP.del('ou=users1,o=myhost,dc=demoApp,dc=com')
      .catch((err) => {
        err.message.should.be.deepEqual('50');
        next();
      });
  });

  it('should reject the request with no such object error code', (next) => {
    clientLDAP.del('ou=users2,o=myhost,dc=demoApp,dc=com')
      .catch((err) => {
        err.message.should.be.deepEqual('32');
        next();
      });
  });



});
