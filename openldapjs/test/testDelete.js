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

  it('should delete the given leaf entry', (next) =>  {
    clientLDAP.unbind()
      .then( () => {
        clientLDAP.bind(dnAdmin,password)
          .then( () => {
            clientLDAP.del('cn=newPointChildBLABLA1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com',[])
              .then( (result) => {
                result.should.be.ok;
              })
              .then( () =>{
                next();
              });
          }).catch( (err) =>{
            console.log(err);
          });
      });

  });

 it('should reject the request to delete non-leaf node', (next) => {
   clientLDAP.unbind()
    .then( () => {
      clientLDAP.bind(dnAdmin,password)
        .then( () => {
          clientLDAP.del('cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com')
            .catch ( (err) => {
              err.message.should.be.deepEqual('66');
              next();
            });
        });
    });
 });

 







 
});




