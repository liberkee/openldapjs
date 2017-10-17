'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config');
const Promise = require('bluebird');
const errList = require('./errorList');
const ErrorHandler = require('../modules/errors/error_dispenser');


describe('Testing the async LDAP add operation', () => {

  let personNr = 1;
  let dnUser;
  const rdnUser = 'cn=testUsers';

  const validEntry = [
    config.ldapAdd.firstAttr,
    config.ldapAdd.secondAttr,
    config.ldapAdd.lastAttr,
  ];
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

    return Promise.all([init1, init2, bind1, bind2])
      .then((result) => {
        dnUser = ` ${rdnUser}${personNr}${config.ldapAdd.dnNewEntry}`;
      });
  });

  afterEach(() => {
    return clientLDAP.unbind()
      .then(() => { return clientLDAP2.unbind(); });
  });

  it.only('should reject the add operation with a wrong dn', () => { // this doesn't work as expected.

    const CustomError = new ErrorHandler(errList.invalidDnSyntax);

    return clientLDAP.add('garbage', validEntry)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(ErrorHandler(errList.invalidDnSyntax), (err) => {
        should.deepEqual(err, new CustomError(errList.ldapAddErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });

  });

  it('should reject the add operation with an invalid entry Object', () => {

    const invalidEntry = [{
      wrong: 'garbage',
      sn: 'Entry',
      description: 'Test',
    }];

    return clientLDAP.add(dnUser, invalidEntry)
      .catch((undefinedTypeErr) => {
        should.deepEqual(undefinedTypeErr.message, errList.entryObjectError);
      });

  });

  it('should reject the add operation with a duplicated entry', () => {
    return clientLDAP.add(config.ldapAuthentication.dnUser, validEntry)
      .catch((duplicatedEntryError) => {
        should.deepEqual(duplicatedEntryError, ErrorHandler(errList.alreadyExists));
      });

  });

  it('should add a single entry', () => {
    return clientLDAP.add(dnUser, validEntry)
      .then((result) => {
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
          should.deepEqual(err, ErrorHandler(errList.alreadyExists));
          personNr += 1;
        });
    });

  // is null the same with '' ? for '' the  resulting error code was 68
  it('should reject add request with empty(null) DN', () => {
    return clientLDAP.add(null, validEntry)
      .catch((err) => {
        should.deepEqual(err.message, errList.typeErrorMessage);
      });
  });


  it('should reject the request if try to rebind',
    () => { // what does this test ?
      return clientLDAP2
        .add(`${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry)
        .catch((accessError) => {
          should.deepEqual(accessError, ErrorHandler(errList.insufficientAccess));

        });
    });

  it('should reject requests done from an unbound state', () => {
    return clientLDAP.unbind()
      .then(() => {
        return clientLDAP.add(
          `${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry);
      })
      .catch((stateError) => {
        should.deepEqual(stateError.message, errList.bindErrorMessage);
      });
  });


  it('should add entries in parallel', () => {
    const first = clientLDAP.add(dnUser, validEntry);
    personNr += 1; // any use for this ?
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

  it('should add a new entry and return the control', () => { // what control ?
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
