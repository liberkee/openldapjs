'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');
const Promise = require('bluebird');

describe('Testing the async LDAP add operation', () => {

  const bindErrorMessage =
      'The operation failed. It could be done if the state of the client is BOUND';
  let personNr = 1;
  let dnUser;
  const invalidDnSyntax = '34';
  const undefinedType = '17';
  const alreadyExists = '68';
  const insufficientAccess = '50';
  const succes = '0';
  const rdnUser = 'cn=testUsers';

  const validEntry = {
    objectClass: config.ldapAdd.objectClass,
    sn: config.ldapAdd.sn,
    description: config.ldapAdd.description,
  }

  const controlOperation = [
    {
      oid: config.ldapControls.ldapModificationControlPostRead.oid,
      value: config.ldapControls.ldapModificationControlPostRead.value,
      iscritical:
          config.ldapControls.ldapModificationControlPostRead.iscritical,
    },
    {
      oid: config.ldapControls.ldapModificationControlPreRead.oid,
      value: config.ldapControls.ldapModificationControlPreRead.value,
      iscritical: config.ldapControls.ldapModificationControlPreRead.iscritical,
    },
  ];

  let clientLDAP = new LDAP(config.ldapAuthentification.host);
  let clientLDAP2 = new LDAP(config.ldapAuthentification.host);
  beforeEach((next) => {
    clientLDAP = new LDAP(config.ldapAuthentification.host);
    clientLDAP2 = new LDAP(config.ldapAuthentification.host);

    clientLDAP.initialize().then(() => {
      clientLDAP
          .bind(
              config.ldapAuthentification.dnAdmin,
              config.ldapAuthentification.passwordAdmin)
          .then(() => {
            clientLDAP2.initialize().then(() => {
              clientLDAP2
                  .bind(
                      config.ldapAuthentification.dnUser,
                      config.ldapAuthentification.passwordUser)
                  .then(() => {
                    dnUser =
                        `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
                    next();
                  });
            });
          });
    });

  });

  afterEach((next) => { clientLDAP.unbind().then(() => { next(); }); });

  it('should reject the add operation with a wrong dn', (next) => {

    clientLDAP.add('garbage', validEntry, []).catch((invalidDnError) => {
      invalidDnError.message.should.be.deepEqual(invalidDnSyntax);
      next();
    });

  });

  it('should reject the add operation with an invalid entry Object', (next) => {

    const invalidEntry = {
      wrong: 'garbage',
      sn: 'Entry',
      description: 'Test',
    };

    clientLDAP.add(dnUser, invalidEntry).catch((undefinedTypeErr) => {
      undefinedTypeErr.message.should.be.deepEqual(undefinedType);
      next();
    });

  });

  it('should reject the add operation with a duplicated entry', (next) => {
    clientLDAP.add(config.ldapAuthentification.dnUser, validEntry)
        .catch((duplicatedEntryError) => {
          duplicatedEntryError.message.should.be.deepEqual(alreadyExists);
          next();
        });
  });

  it('should add a single entry', (next) => {
    clientLDAP.add(dnUser, validEntry).then((result) => {
      result.should.be.deepEqual(0);
      personNr = personNr + 1;
      next();
    });
  });

  it('should add multiple entries sequentialy and reject to add a duplicate',
     (next) => {
       clientLDAP.add(dnUser, validEntry).then((res1) => {
         personNr = personNr + 1;
         dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
         res1.should.be.deepEqual(0);
         clientLDAP.add(dnUser, validEntry).then((res2) => {
           personNr = personNr + 1;
           dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
           res2.should.be.deepEqual(0);
           clientLDAP.add(dnUser, validEntry).then((res3) => {
             res3.should.be.deepEqual(0);
             clientLDAP.add(dnUser, validEntry).catch((err) => {
               err.message.should.be.deepEqual(alreadyExists);
               personNr = personNr + 1;
               next();
             });

           });
         });
       });

     });

  // is null the same with '' ? for '' the  resulting error code was 68
  it('should reject add request with empty(null) DN', (next) => {
    const errorMessage = 'The null is not string';
    clientLDAP.add(null, validEntry).catch((err) => {
      err.message.should.be.deepEqual(errorMessage);
      next();
    });
  });


  it('should reject the request if try to rebind', (next) => {
    clientLDAP2.add(`${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry)
        .catch((accessError) => {
          accessError.message.should.be.deepEqual(insufficientAccess);
          next();
        });
  });

  it('should reject requests done from an unbound state', (next) => {
    clientLDAP.unbind().then(() => {
      clientLDAP.add(`${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry)
          .catch((stateError) => {
            stateError.message.should.be.deepEqual(bindErrorMessage);
            next();
          });
    });
  });


  it('should add entries in parallel', (next) => {
    const first = clientLDAP.add(dnUser, validEntry);
    personNr = personNr + 1;
    dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
    const second = clientLDAP.add(dnUser, validEntry);
    personNr = personNr + 1;
    dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
    const third = clientLDAP.add(dnUser, validEntry);
    personNr = personNr + 1;

    Promise.all([first, second, third]).then((values) => {
      values.forEach((result) => { result.should.be.deepEqual(0); });
      next();
    });
  });

  it('should add a new entry and return the control', (next) => {
    clientLDAP.add(dnUser, validEntry, controlOperation).then((result) => {
      let resultOperation;
      resultOperation = result.split('\n');
      resultOperation = resultOperation[1].split(':');
      resultOperation = resultOperation[1];
      should.deepEqual(resultOperation, ` ${dnUser}`);
      next();
    });
  });

});
