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
  const stringError = 'The null is not string';
  const successResult = 0;
  const invalidDnSyntax = '34';
  const unwillingToPerform = '53';
  const noSuchObject = '32';
  const notAllowedOnNonleaf = '66';
  let personNr = 1;
  const bindErrorMessage =
  'The operation failed. It could be done if the state of the client is BOUND';

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

  beforeEach((next) => {
    clientLDAP = new LDAP(host);

    clientLDAP.initialize().then(() => {
      clientLDAP.bind(dnAdmin, password).then(() => {
        dnUser =
            `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
        next();
      });
    });
  });
  afterEach((next) => {
    clientLDAP.unbind().then(() => { next(); });

  });

  /* trying to delete with an invalid dn syntax => ldap error code 34 */
  it('should reject the request with invalidDN error code', (next) => {
    clientLDAP.del('garbage').catch((err) => {
      err.message.should.be.deepEqual(invalidDnSyntax);
      next();
    });
  });

  it('should reject the request for passing an empty DN', (next) => {
    clientLDAP.del('').catch((err) => {
      err.message.should.be.deepEqual(unwillingToPerform);
      next();
    });
  });

  it('should reject the request for passing a null DN', (next) => {
    clientLDAP.del(null).catch((err) => {
      err.message.should.be.deepEqual(stringError);
      next();
    });
  });

  it('should reject the request with no such object error code', (next) => {
    const rdnUser = 'cn=a1User32,cn=no12DD';
    clientLDAP.del(`${rdnUser}${config.ldapDelete.dn}`).catch((err) => {
      err.message.should.be.deepEqual(noSuchObject);
      next();
    });
  });

  it('should delete the given leaf entry', (next) => {
    clientLDAP.del(dnUser)
        .then((result) => { should.deepEqual(result, successResult); })
        .then(() => {
          personNr = personNr + 1;
          next();
        });
  });

  it('should reject the request to delete non-leaf node', (next) => {
    const stringLength = config.ldapDelete.dn.length;
    let parentDn = config.ldapDelete.dn.slice(1, stringLength);
    clientLDAP.del(parentDn).catch((err) => {
      err.message.should.be.deepEqual(notAllowedOnNonleaf);
      next();
    });
  });


  it('should reject because BOUND state is required', (next) => {
    clientLDAP.unbind().then(() => {
      clientLDAP.del(dnUser).catch((err) => {
        should.deepEqual(err.message, bindErrorMessage);
        next();
      });
    });
  });

  it('should delete sequential requests with one error', (next) => {
    clientLDAP.del(dnUser).then((res1) => {
      should.deepEqual(res1, successResult);
      clientLDAP.del(dnUser).catch((err2) => {
        personNr = personNr + 1;
        dnUser =
            `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
        should.deepEqual(err2.message, noSuchObject);
        clientLDAP.del(dnUser).then((res3) => {
          personNr = personNr + 1;
          should.deepEqual(res3, successResult);
          next();
        });
      });
    });
  });

  it('should delete in paralel requests with one error', (next) => {
    const first = clientLDAP.del(dnUser);
    personNr = personNr + 1;
    dnUser = `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
    const second = clientLDAP.del(dnUser);
    personNr = personNr + 1;
    dnUser = `${config.ldapDelete.rdnUser}${personNr}${config.ldapDelete.dn}`;
    const third = clientLDAP.del(dnUser);
    personNr = personNr + 1;    

    Promise.all([first, second, third]).then((values) => {
      should.deepEqual(values[0], successResult);
      should.deepEqual(values[1], successResult);
      should.deepEqual(values[2], successResult);
      next();
    });
  });

  it('should delete an exist entry and return the control', (next) => {
    clientLDAP.del(dnUser, controlOperation).then((result) => {
      let resultOperation;
      resultOperation = result.split('\n');
      resultOperation = resultOperation[1].split(':');
      resultOperation = resultOperation[1];
      should.deepEqual(resultOperation, ` ${dnUser}`);
      next();
    });
  });
  
});
