'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const Promise = require('bluebird');
const heapdump = require('heapdump');

describe('Testing the async LDAP add operation', () => {

  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';

  let clientLDAP = new LDAP(host);
  heapdump.writeSnapshot('/home/hufserverldap/Desktop/Share/raribas/openldapjs/openldapjs/Snapshots/' + Date.now() + '.heapsnapshot');

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

  afterEach(() => {
    clientLDAP.unbind()
      .then(() => {
      });
  });

  it('should reject the add operation with a wrong dn', (next) => {

    const validEntry = {
      objectClass: 'inetOrgPerson',
      sn: 'Entry',
      description: 'Test',
    };

    clientLDAP.add('garbage', validEntry, [])
      .catch((invalidDnError) => {
        invalidDnError.message.should.be.deepEqual('34');
        next();
      });

  });

  it('should reject the add operation with an invalid entry Object', (next) => {

    const invalidEntry = {
      wrong: 'garbage',
      sn: 'Entry',
      description: 'Test',
    };

    clientLDAP.add('cn=newPointChildBLABL0,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', invalidEntry)
      .catch((undefinedTypeErr) => {
        undefinedTypeErr.message.should.be.deepEqual('17');
        next();
      });
  });

  it('should reject the add operation with a duplicated entry', (next) => {
    const entry = {
      objectClass: 'inetOrgPerson',
      sn: 'Entryz',
      description: 'Testz',
    };

    clientLDAP.add('cn=newPointChildBLABLA10,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry)
      .catch((duplicatedEntryError) => {
        duplicatedEntryError.message.should.be.deepEqual('68');
        next();
      });
  });

  it('should add a single entry', (next) => {
    const singleEntry = {
      objectClass: 'person',
      sn: 'Entry',
      description: 'TestEntry',
    };

    clientLDAP.add('cn=newTestEntry0,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', singleEntry)
      .then((result) => {
        result.should.be.deepEqual(0);
        next();
      });
  });

  it('should add multiple entries sequentialy and reject to add a duplicate', (next) => {
    const entry = {
      objectClass: 'person',
      sn: 'Entry',
      description: 'TestEntry',
    };

    clientLDAP.add('cn=newTestEntry1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry)
      .then((res1) => {
        res1.should.be.deepEqual(0);
        clientLDAP.add('cn=newTestEntry2,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry)
          .then((res2) => {
            res2.should.be.deepEqual(0);
            clientLDAP.add('cn=newTestEntry3,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry)
              .then((res3) => {
                res3.should.be.deepEqual(0);
                clientLDAP.add('cn=newTestEntry1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry)
                  .catch((err) => {
                    err.message.should.be.deepEqual('68');
                    next();
                  });

              });
          });
      });

  });

  // is null the same with '' ? for '' the  resulting error code was 68
  it('should reject add request with empty(null) DN', (next) => {
    const entry = {
      objectClass: 'person',
      sn: 'Entry',
      description: 'Test',
    };

    clientLDAP.add(null, entry)
      .catch((err) => {
        err.message.should.be.deepEqual('34');
        next();
      });
  });


  it('should reject the request from a user with no permission', (next) => {
    const entry = {
      objectClass: 'person',
      sn: 'Entry',
      description: 'Tesst',
    };
    clientLDAP.bind(dnUser, password)
      .then(() => {
        clientLDAP.add('cn=newTopEntry,dc=demoApp,dc=com', entry)
          .catch((accessError) => {
            accessError.message.should.be.deepEqual('50');
            next();
          });
      });
  });

  it('should reject requests done from an unbound state', (next) => {
    const entry = {
      objectClass: 'person',
      sn: 'Entry',
      description: 'Tesst',
    };

    clientLDAP.unbind()
      .then(() => {
        clientLDAP.add('cn=newTopEntry,dc=demoApp,dc=com', entry)
          .catch((stateError) => {
            stateError.message.should.be.deepEqual('The add operation can be done just in BOUND state');
            next();
          });
      });
  });


  it('should add entries in parallel', (next) => {
    const entry = {
      objectClass: 'person',
      sn: 'Entry',
      description: 'Tesst',
    };

    const first = clientLDAP.add('cn=newTestEntry97,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry);
    const second = clientLDAP.add('cn=newTestEntry98,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry);
    const third = clientLDAP.add('cn=newTestEntry99,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com', entry);

    Promise.all([first, second, third])
      .then((values) => {
        values.forEach((result) => {
          result.should.be.deepEqual(0);
        });
        next();
      });
  });

});
