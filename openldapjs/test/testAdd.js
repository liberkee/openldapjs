'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');

describe('Testing the async LDAP add operation', () => {

  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';

  let clientLDAP = new LDAP(host);

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
      description: 'Test'
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
      description: 'Test'
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
      description: 'Testz'
    };

    clientLDAP.add('cn=newPointChildBLABLA10,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com',entry)
      .catch( (duplicatedEntryError) => {
        duplicatedEntryError.message.should.be.deepEqual('68');
        next();
      });
  });

  it('should add a single entry', (next) => {
    const singleEntry ={ 
      objectClass: 'person',
      sn: 'Entry',
      description: 'TestEntry'
    };

    clientLDAP.add('cn=newTestEntry0,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com',singleEntry)
      .then((result) => {
        result.should.be.ok;
        next();  
      });
  });

  it('should add multiple entries sequentialy and reject to add a duplicate', (next) => {
     const entry ={ 
      objectClass: 'person',
      sn: 'Entry',
      description: 'TestEntry'
    };

    clientLDAP.add('cn=newTestEntry1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com',entry)
      .then( (res1) => {
        res1.should.be.ok;
        clientLDAP.add('cn=newTestEntry2,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com',entry)
          .then ( (res2) => {
            res2.should.be.ok;
            clientLDAP.add('cn=newTestEntry3,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com',entry)
              .then( (res3) => {
                res3.should.be.ok;
                clientLDAP.add('cn=newTestEntry1,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com',entry)
                  .catch( (err) => {
                    err.message.should.be.deepEqual('68');
                    next();
                  });

              });
          });
      });

  });

it(should)





});