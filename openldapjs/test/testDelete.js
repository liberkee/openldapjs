'use strict';

const LDAP = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const Promise = require('bluebird');
const config = require('./config.json');

describe('Testing the async LDAP delete operation', () => {

  const host = config.ldapAuthentification.host;
  const dnAdmin = config.ldapAuthentification.dnAdmin;
  let dnUser;
  const password = config.ldapAuthentification.passwordAdmin;
  const stringError = new TypeError('Wrong type');
  const successResult = 0;
  const invalidDnSyntax = 34;
  const unwillingToPerform = 53;
  const noSuchObject = 32;
  const notAllowedOnNonleaf = 66;
  let personNr = 1;
  const bindErrorMessage = new Error(
      'The operation failed. It could be done if the state of the client is BOUND');

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
  it('should reject the request with invalidDN error code', () => {
    return clientLDAP.delete('garbage')
    .catch(
        (err) => { err.should.be.deepEqual(invalidDnSyntax); });
  });

  it('should reject the request for passing an empty DN', () => {
    return clientLDAP.delete('')
    .catch(
        (err) => { err.should.be.deepEqual(unwillingToPerform); });
  });

  it('should reject the request for passing a null DN', () => {
    return clientLDAP.delete(null)
    .catch(
        (err) => { err.should.be.deepEqual(stringError); });
  });

  it('should reject the request with no such object error code', () => {
    const rdnUser = 'cn=a1User32,cn=no12DD';
    return clientLDAP.delete(`${rdnUser}${config.ldapDelete.dn}`)
        .catch((err) => { err.should.be.deepEqual(noSuchObject); });
  });

  it('should delete the given leaf entry', () => {
    return clientLDAP.delete(dnUser)
    .then((result) => {
      should.deepEqual(result, successResult);
      personNr += 1;
    });
  });

  it('should reject the request to delete non-leaf node', () => {
    const stringLength = config.ldapDelete.dn.length;
    const parentDn = config.ldapDelete.dn.slice(1, stringLength);
    return clientLDAP.delete(parentDn)
    .catch((err) => { err.should.be.deepEqual(notAllowedOnNonleaf); });
  });


  it('should reject because BOUND state is required', () => {
    return clientLDAP.unbind()
        .then(() => { return clientLDAP.delete(dnUser); })
        .catch((err) => { should.deepEqual(err, bindErrorMessage); });
  });

  it('should delete sequential requests with one error', () => {
    return clientLDAP.delete(dnUser)
        .then((res1) => {
          should.deepEqual(res1, successResult);
          return clientLDAP.delete(dnUser);
        })
        .catch((err) => {
          personNr += 1;
          dnUser =
              `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
          should.deepEqual(err, noSuchObject);
          return clientLDAP.delete(dnUser);
        })
        .then((res3) => {
          personNr += 1;
          should.deepEqual(res3, successResult);
        });
  });


  it('should delete in paralel requests with one error', () => {
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
      should.deepEqual(values[0], successResult);
      should.deepEqual(values[1], successResult);
      should.deepEqual(values[2], successResult);
      should.deepEqual(values[3], successResult);
    });
  });

  it('should delete an exist entry and return the control', () => {
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
