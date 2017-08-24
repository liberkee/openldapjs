'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const Promise = require('bluebird');
// const heapdump = require('heapdump');

describe('Testing the async LDAP delete operation', () => {

  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';
  const successResult = 0;

  const resBindStateReq = 'The Delete operation can be done just in BOUND state';

  let clientLDAP = new LDAP(host);
  /*  heapdump.writeSnapshot(
    '/home/hufserverldap/Desktop/Share/raribas/openldapjs/openldapjs/SnapshotsDelete/'
                              +Date.now()+'.heapsnapshot');
 */
  beforeEach((next) => {
    clientLDAP = new LDAP(host);

    clientLDAP.initialize()
      .then(() => {
        clientLDAP.bind(dnAdmin, password)
          .then(() => {
            next();
          });
      });
  });
  afterEach((next) => {
    clientLDAP.unbind()
      .then(() => {
        next();
      });

  });

  /* trying to delete with an invalid dn syntax => ldap error code 34 */
  it('should reject the request with invalidDN error code', (next) => {
    clientLDAP.del('garbage')
      .catch((err) => {
        err.message.should.be.deepEqual('34');
        next();
      });
  });

  it('should reject the request for passing an empty DN', (next) => {
    clientLDAP.del('')
      .catch((err) => {
        err.message.should.be.deepEqual('53');
        next();
      });
  });

  it('should reject the request for passing a null DN', (next) => {
    clientLDAP.del(null)
      .catch((err) => {
        err.message.should.be.deepEqual('34');
        next();
      });
  });
  /*
    it('should reject the request with insufficient access error code', (next) => {
      clientLDAP.bind(dnUser, password)
        .then(() => {
          clientLDAP.del('ou=users1,o=myhost,dc=demoApp,dc=com')
            .catch((err) => {
              err.message.should.be.deepEqual('50');
            });
          next();
        });
    });
    */

  it('should reject the request with no such object error code', (next) => {
    clientLDAP.del('ou=users2,o=myhost,dc=demoApp,dc=com')
      .catch((err) => {
        err.message.should.be.deepEqual('32');
        next();
      });
  });

  it('should delete the given leaf entry', (next) => {

    clientLDAP.del('cn=newPointChildBLABLA1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', [])
      .then((result) => {
        should.deepEqual(result, successResult);
      })
      .then(() => {
        next();
      });
  });

  it('should reject the request to delete non-leaf node', (next) => {
    clientLDAP.del('cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com')
      .catch((err) => {
        err.message.should.be.deepEqual('66');
        next();
      });
  });


  it('should reject because BOUND state is required', (next) => {
    clientLDAP.unbind()
      .then(() => {
        clientLDAP.del('cn=newPointChildBLABLA1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', [])
          .catch((err) => {
            should.deepEqual(err.message, resBindStateReq);
            next();
          });
      });
  });

  it('should delete sequential requests with one error', (next) => {
    clientLDAP.del('cn=newPointChildBLABLA2,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', [])
      .then((res1) => {
        should.deepEqual(res1, successResult);
        clientLDAP.del('cn=newPointChildBLABLA2,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', [])
          .catch((err2) => {
            should.deepEqual(err2.message, '32');
            clientLDAP.del('cn=newPointChildBLABLA3,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', [])
              .then((res3) => {
                should.deepEqual(res3, successResult);
                next();
              });
          });
      });
  });

  it('should delete in paralel requests with one error', (next) => {
    const first = clientLDAP.del('cn=newPointChildBLABLA4,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', []);
    const second = clientLDAP.del('cn=newPointChildBLABLA5,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', []);
    const third = clientLDAP.del('cn=newPointChildBLABLA6,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', []);

    Promise.all([first, second, third])
      .then((values) => {
        should.deepEqual(values[0], successResult);
        should.deepEqual(values[1], successResult);
        should.deepEqual(values[2], successResult);
        next();
      });
  });
});
