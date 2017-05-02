'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
//const clientLDAP = new LDAPWrap();

describe('Testing the async LDAP search ', () => {
  const host = 'ldap://localhost:389';
  const dn = 'cn=admin,dc=demoApp,dc=com';
  const password = 'secret';
  let clientLDAP = new LDAPWrap(host);

  beforeEach((next) => {
    clientLDAP = new LDAPWrap(host);


    clientLDAP.initialize()
      .then(() => {
        clientLDAP.bind(dn,password)
        .then(() => {
          next();
        });
        
      });
  });
  afterEach(() => {
    clientLDAP.unbind();
  });

  it('should return an empty search', (next) => {
    clientLDAP.search('ou=users,o=myhost,dc=demoApp,dc=com', 2, 'objectclass=person')
      .then((result) => {
        console.log(result);
        //should.deepEqual(result,undefined);
        //next();
        result.should.be.empty;
      }).then(() =>{
        next();
      });
  });

  it('should return a search with non existing searc base', (next) => {
    clientLDAP.search('','base','objectclass=*')
      .then( (result) => {
        console.log('result is : '+ result);
        should.deepEqual(result,undefined);
      }).then( () => {
        next();
      });
    
  });
 

});