'use strict';

const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');

describe('Testing the binding/unbinding routines', () => {

  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const searchBase = 'dc=demoApp,dc=com';
  const password = 'secret';
  let clientLDAP = new LDAPWrap(host);

  beforeEach( (next) => {
    clientLDAP = new LDAPWrap(host);

    clientLDAP.initialize()
      .then( () => {
        clientLDAP.bind(dnAdmin,password)
          .then ( () => {
            next();
          });
      });
  });

  afterEach( () => {
    clientLDAP.unbind()
      .then( () => {

      });
  });

  it('should unbind and bind in a loop until it times out', (next) => {
    while(true){
      clientLDAP.unbind()
        .then( () => {
        //  clientLDAP = new LDAPWrap(host);
          clientLDAP.bind(dnAdmin,password);
        });
      
    }
   

  });

});