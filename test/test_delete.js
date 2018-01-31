'use strict';

const LDAP = require('../libs/ldap_async_wrap.js');
const should = require('should');
const Promise = require('bluebird');
const config = require('./config.json');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const StateError = require('../libs/errors/state_error');
const errorCodes = require('./error_codes');
const errorMessages = require('../libs/messages.json');

describe('Testing the async LDAP delete operation', () => {

  const host = config.ldapAuthentication.host;
  const dnAdmin = config.ldapAuthentication.dnAdmin;
  let dnUser;
  const password = config.ldapAuthentication.passwordAdmin;
  let personNr = 1;

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

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  let clientLDAP = new LDAP(host);

  beforeEach(() => {
    clientLDAP = new LDAP(host);

    return clientLDAP.initialize()
      .then(() => { return clientLDAP.bind(dnAdmin, password); })
      .then(() => {
        dnUser =
          `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
      });
  });
  afterEach(() => { return clientLDAP.unbind(); });

  /* trying to delete with an invalid dn syntax => ldap error code 34 */
  it('should reject the request with invalidDn error code', () => {

    const CustomError = errorHandler(errorCodes.invalidDnSyntax);

    return clientLDAP.delete('garbage')
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        err.should.be.deepEqual(new CustomError(errorMessages.ldapDeleteErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject the request if the DN is empty', () => {

    const CustomError = errorHandler(errorCodes.unwillingToPerform);

    return clientLDAP.delete('')
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        err.should.be.deepEqual(new CustomError(errorMessages.ldapDeleteErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject the request for passing a null DN', () => {
    return clientLDAP.delete(null)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(TypeError, (err) => {
        err.message.should.be.deepEqual(errorMessages.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should reject the request with no such object error code', () => {
    const rdnUser = 'cn=a1User32,cn=no12DD';
    const CustomError = errorHandler(errorCodes.ldapNoSuchObject);
    return clientLDAP.delete(`${rdnUser}${config.ldapDelete.dn}`)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        err.should.be.deepEqual(new CustomError(errorMessages.ldapDeleteErrorMessage));
      })
      .catch(() => {
        should.fail('did not expect generic error');
      });
  });

  it('should delete the given leaf entry', () => {
    return clientLDAP.delete(dnUser)
      .then((result) => {
        should.deepEqual(result, errorCodes.resultSuccess);
        personNr += 1;
      });

  });

  it('should reject the request to delete non-leaf node', () => {
    const stringLength = config.ldapDelete.dn.length;
    const parentDn = config.ldapDelete.dn.slice(1, stringLength);
    const CustomError = errorHandler(errorCodes.notAllowedOnNonLeaf);
    return clientLDAP.delete(parentDn)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        err.should.be.deepEqual(new CustomError(errorMessages.ldapDeleteErrorMessage));
      })
      .catch(() => {
        should.fail('did not expect generic error');
      });
  });


  it('should reject because BOUND state is required', () => {
    return clientLDAP.unbind()
      .then(() => { return clientLDAP.delete(dnUser); })
      .catch(StateError, (stateError) => {
        should.deepEqual(stateError.message, errorMessages.bindErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should delete sequential requests with one error', () => {
    const CustomError = errorHandler(errorCodes.ldapNoSuchObject);
    return clientLDAP.delete(dnUser)
      .then((res1) => {
        should.deepEqual(res1, errorCodes.resultSuccess);
        return clientLDAP.delete(dnUser);
      })
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        personNr += 1;
        dnUser =
          `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
        should.deepEqual(err, new CustomError(errorMessages.ldapDeleteErrorMessage));
        return clientLDAP.delete(dnUser);
      })
      .catch(() => {
        should.fail('did not expect generic error');
      })
      .then((res3) => {
        personNr += 1;
        should.deepEqual(res3, errorCodes.resultSuccess);
      });
  });


  it('should delete 4 entries in parallel ', () => {
    const first = clientLDAP.delete(dnUser);
    personNr += 1;
    dnUser = `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
    const second = clientLDAP.delete(dnUser);
    personNr += 1;
    dnUser = `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
    const third = clientLDAP.delete(dnUser);
    personNr += 1;
    dnUser = `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
    const four = clientLDAP.delete(dnUser);
    personNr += 1;

    return Promise.all([first, second, third, four])
      .then((values) => {
        should.deepEqual(values[0], errorCodes.resultSuccess);
        should.deepEqual(values[1], errorCodes.resultSuccess);
        should.deepEqual(values[2], errorCodes.resultSuccess);
        should.deepEqual(values[3], errorCodes.resultSuccess);
      });
  });

  it('should delete an existing entry and return the control',
    () => {
      return clientLDAP.delete(dnUser, controlOperation)
        .then((result) => {
          let resultOperation;
          resultOperation = result.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          should.deepEqual(resultOperation, ` ${dnUser}`);
        });
    });

});
