'use strict';

const LDAP = require('../libs/ldap_async_wrap.js');
const should = require('should');
const config = require('./config');
const Promise = require('bluebird');
const errorList = require('./error_list');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const StateError = require('../libs/errors/state_error');
const ValidationError = require('../libs/errors/validation_error');
const controlsOID = require('../libs/controlOid.json');

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
      oid: controlsOID.postread,
      value: config.ldapControls.ldapModificationControlPostRead.value,
      isCritical:
          config.ldapControls.ldapModificationControlPostRead.isCritical,
    },
    {
      oid: controlsOID.preread,
      value: config.ldapControls.ldapModificationControlPreRead.value,
      isCritical: config.ldapControls.ldapModificationControlPreRead.isCritical,
    },
  ];

  let clientLDAP = new LDAP(config.ldapAuthentication.host);
  let clientLDAP2 = new LDAP(config.ldapAuthentication.host);

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    clientLDAP = new LDAP(config.ldapAuthentication.host);
    clientLDAP2 = new LDAP(config.ldapAuthentication.host);

    const init1 = clientLDAP.initialize();
    const init2 = clientLDAP2.initialize();

    const startTLS1 = clientLDAP.startTLS(pathToCert);
    const startTLS2 = clientLDAP2.startTLS(pathToCert);

    return Promise.all([init1, init2, startTLS1, startTLS2])
      .then(() => {
        const bind1 = clientLDAP.bind(
          config.ldapAuthentication.dnAdmin,
          config.ldapAuthentication.passwordAdmin);
        const bind2 = clientLDAP2.bind(
          config.ldapAuthentication.dnUser,
          config.ldapAuthentication.passwordUser);

        return Promise.all([bind1, bind2]);
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

    const CustomError = errorHandler(errorList.invalidDnSyntax);

    return clientLDAP.add('garbage', validEntry)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapAddErrorMessage));
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
      .then(() => {
        should.fail('should not succeed');
      })
      .catch(ValidationError, (undefinedTypeErr) => {
        should.deepEqual(undefinedTypeErr.message, errorList.entryObjectError);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });

  });


  it('should reject the add operation with a duplicated entry', () => {
    const CustomError = errorHandler(errorList.alreadyExists);
    return clientLDAP.add(config.ldapAuthentication.dnUser, validEntry)
      .then(() => {
        should.fail('should not succeed');
      })
      .catch(CustomError, (duplicatedEntryError) => {
        should.deepEqual(duplicatedEntryError, new CustomError(errorList.ldapAddErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });

  });

  it('should add a single entry', () => {
    return clientLDAP.add(dnUser, validEntry)
      .then((result) => {
        result.should.be.deepEqual(0);
        personNr += 1;
      });

  });

  it('should add multiple entries sequentially and reject to add a duplicate', () => {
    const CustomError = errorHandler(errorList.alreadyExists);
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
      .then(() => {
        should.fail('should not succeed');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errorList.ldapAddErrorMessage));
        personNr += 1;
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject add request with empty(null) DN', () => {
    return clientLDAP.add(null, validEntry)
      .then(() => {
        should.fail('should not succeed');
      })
      .catch(TypeError, (err) => {
        should.deepEqual(err.message, errorList.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });


  it('should reject the request if try to rebind', () => {
    const CustomError = errorHandler(errorList.insufficientAccess);
    return clientLDAP2
      .add(`${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry)
      .then(() => {
        should.fail(' should not succeed');
      })
      .catch(CustomError, (accessError) => {
        should.deepEqual(accessError, new CustomError(errorList.ldapAddErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject requests done from an unbound state', () => {
    return clientLDAP.unbind()
      .then(() => {
        return clientLDAP.add(
          `${rdnUser}${config.ldapAdd.dnNewEntryAdmin}`, validEntry);
      })
      .then(() => {
        should.fail('should not succeed');
      })
      .catch(StateError, (stateError) => {
        should.deepEqual(stateError.message, errorList.bindErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
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

  it('should add a new entry and return the attributes that was required in control', () => {
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
