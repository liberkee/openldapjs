'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');
const Promise = require('bluebird');
const errList = require('./errorlist.json');

describe('Testing the async LDAP add operation', () => {

  let personNr = 1;
  let dnUser;
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
      isCritical:
          config.ldapControls.ldapModificationControlPostRead.isCritical,
    },
    {
      oid: config.ldapControls.ldapModificationControlPreRead.oid,
      value: config.ldapControls.ldapModificationControlPreRead.value,
      isCritical: config.ldapControls.ldapModificationControlPreRead.isCritical,
    },
  ];

  let clientLDAP = new LDAP(config.ldapAuthentication.host);
  let clientLDAP2 = new LDAP(config.ldapAuthentication.host);

  beforeEach(() => {
    clientLDAP = new LDAP(config.ldapAuthentication.host);
    clientLDAP2 = new LDAP(config.ldapAuthentication.host);

    const init1 = clientLDAP.initialize();
    const init2 = clientLDAP2.initialize();
    const bind1 = clientLDAP.bind(
        config.ldapAuthentication.dnAdmin,
        config.ldapAuthentication.passwordAdmin);
    const bind2 = clientLDAP2.bind(
        config.ldapAuthentication.dnUser,
        config.ldapAuthentication.passwordUser);

    return Promise.all([init1, init2, bind1, bind2]).then((result) => {
      dnUser = ` ${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
    });
  });

  afterEach(() => {
    return clientLDAP.unbind().then(() => { return clientLDAP2.unbind(); });
  });

  it('should reject the add operation with a wrong dn', () => {

    return clientLDAP.add('garbage', validEntry).catch((invalidDnError) => {
      should.deepEqual(invalidDnError, errList.invalidDnSyntax);
    });

  });

  it('should reject the add operation with an invalid entry Object', () => {

    const invalidEntry = {
      wrong: 'garbage',
      sn: 'Entry',
      description: 'Test',
    };

    return clientLDAP.add(dnUser, invalidEntry).catch((undefinedTypeErr) => {
      should.deepEqual(undefinedTypeErr, errList.undefinedType);
    });

  });

  it('should reject the add operation with a duplicated entry', () => {
    return clientLDAP.add(config.ldapAuthentication.dnUser, validEntry)
        .catch((duplicatedEntryError) => {
          should.deepEqual(duplicatedEntryError, errList.alreadyExists);
        });

  });

  it('should add a single entry', () => {
    return clientLDAP.add(dnUser, validEntry).then((result) => {
      result.should.be.deepEqual(0);
      personNr += 1;
    });

  });

  it('should add multiple entries sequentially and reject to add a duplicate',
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
             should.deepEqual(err, errList.alreadyExists);
             personNr += 1;
           });
     });

  // is null the same with '' ? for '' the  resulting error code was 68
  it('should reject add request with empty(null) DN', () => {
    const dnEntryError = new TypeError('Wrong type');
    return clientLDAP.add(null, validEntry).catch((err) => {
      should.deepEqual(err, dnEntryError);
    });
  });


  it('should reject the request if try to rebind', () => {
    return clientLDAP2
        .add(`${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry)
        .catch((accessError) => {
          should.deepEqual(accessError, errList.insufficientAccess);

        });
  });

  it('should reject requests done from an unbound state', () => {
    return clientLDAP.unbind()
        .then(() => {
          return clientLDAP.add(
              `${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry);
        })
        .catch((stateError) => {
          should.deepEqual(stateError, errList.bindErrorMessage);
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

    return Promise.all([first, second, third].map(p => p.catch(e => e)))
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
