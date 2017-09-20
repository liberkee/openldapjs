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
  };

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

  beforeEach(() => {
    clientLDAP = new LDAP(config.ldapAuthentification.host);
    clientLDAP2 = new LDAP(config.ldapAuthentification.host);

    return clientLDAP.initialize()
        .then(() => {
          return clientLDAP.bind(
              config.ldapAuthentification.dnAdmin,
              config.ldapAuthentification.passwordAdmin);
        })
        .then(() => { return clientLDAP2.initialize(); })
        .then(() => {
          return clientLDAP2.bind(
              config.ldapAuthentification.dnUser,
              config.ldapAuthentification.passwordUser);
        })
        .then(() => {
          dnUser = ` ${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
        });
  });

  afterEach(() => {
    return clientLDAP.unbind()
    .then(() => { return clientLDAP2.unbind(); });
  });

  it('should reject the add operation with a wrong dn', () => {

    return clientLDAP.add('garbage', validEntry, [])
    .catch((invalidDnError) => {
      invalidDnError.message.should.be.deepEqual(invalidDnSyntax);
    });

  });

  it('should reject the add operation with an invalid entry Object', () => {

    const invalidEntry = {
      wrong: 'garbage',
      sn: 'Entry',
      description: 'Test',
    };

    return clientLDAP.add(dnUser, invalidEntry)
        .catch((undefinedTypeErr) => {
          undefinedTypeErr.message.should.be.deepEqual(undefinedType);
        });

  });

  it('should reject the add operation with a duplicated entry', () => {
    return clientLDAP.add(config.ldapAuthentification.dnUser, validEntry)
        .catch((duplicatedEntryError) => {
          duplicatedEntryError.message.should.be.deepEqual(alreadyExists);
        });

  });

  it('should add a single entry', () => {
    return clientLDAP.add(dnUser, validEntry)
    .then((result) => {
      result.should.be.deepEqual(0);
      personNr += 1;
    });

  });

  it('should add multiple entries sequentialy and reject to add a duplicate',
     () => {
       return clientLDAP.add(dnUser, validEntry)
           .then((res1) => {
             personNr += 1;
             dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
             res1.should.be.deepEqual(0);
             return clientLDAP.add(dnUser, validEntry);
           })
           .then((res2) => {
             personNr += 1;
             dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
             res2.should.be.deepEqual(0);
             return clientLDAP.add(dnUser, validEntry);
           })
           .then((res3) => {
             res3.should.be.deepEqual(0);
             return clientLDAP.add(dnUser, validEntry);
           })
           .catch((err) => {
             err.message.should.be.deepEqual(alreadyExists);
             personNr += 1;
           });
     });

  // is null the same with '' ? for '' the  resulting error code was 68
  it('should reject add request with empty(null) DN', () => {
    const errorMessage = 'The null is not string';
    return clientLDAP.add(null, validEntry)
    .catch((err) => {
      err.message.should.be.deepEqual(errorMessage);
    });
  });


  it('should reject the request if try to rebind', () => {
    return clientLDAP2
        .add(`${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry)
        .catch((accessError) => {
          accessError.message.should.be.deepEqual(insufficientAccess);
        });
  });

  it('should reject requests done from an unbound state', () => {
    return clientLDAP.unbind()
        .then(() => {
          return clientLDAP.add(
              `${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry);
        })
        .catch((stateError) => {
          stateError.message.should.be.deepEqual(bindErrorMessage);
          return stateError;
        });
  });


  it('should add entries in parallel', () => {
    const first = clientLDAP.add(dnUser, validEntry);
    personNr += 1;
    dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
    const second = clientLDAP.add(dnUser, validEntry);
    personNr += 1;
    dnUser = `${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
    const third = clientLDAP.add(dnUser, validEntry);
    personNr += 1;

    return Promise.all([first, second, third])
    .then((values) => {
      values.forEach((result) => { result.should.be.deepEqual(0); });
    });
  });

  it('should add a new entry and return the control', () => {
    return clientLDAP.add(dnUser, validEntry, controlOperation)
        .then((result) => {
          let resultOperation;
          resultOperation = result.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          should.deepEqual(resultOperation, `${dnUser}`);
        });
  });

});
