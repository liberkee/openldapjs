'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const should = require('should');

describe('Testing the rename functionalities', () => {
  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

  const dnError = 'The dn is not string ';
  const resStateRequired =
      'The operation failed. It could be done if the state of the client is BOUND';
  const newrdnError = 'The newrdn is not string ';
  const newparentError = 'The newparent is not string ';
  const controlArrayError = 'The controls is not array';
  const controlPropError =
      'ValidationError: Missing required property: oid,ValidationError: Missing required property: value,ValidationError: Missing required property: iscritical';
  const invalidDnSyntax = '34';
  const noSuchObject = '32';
  const badDn = 'not good dn';
  const badNewParent = 'not good dn';
  const existDn = 'cn=1,ou=users,o=myhost,dc=demoApp,dc=com';
  const notCorectDefinedDn = 'cn=admin';
  const notCorectDefinedNewParent = 'ou=users';
  const UnwillingToPerform = '53';
  const affectMultipleDsas = '71';

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

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

    ldapAsyncWrap.initialize()
    .then(() => {
      ldapAsyncWrap
          .bind(
              config.ldapAuthentification.dnAdmin,
              config.ldapAuthentification.passwordAdmin)
          .then(() => { next(); });
    });
  });

  afterEach(() => {
    ldapAsyncWrap.unbind()
    .then(() => {
    });
  });

  it('should reject if dn is not a string', (next) => {
    ldapAsyncWrap
        .rename(1, config.ldapRename.newrdn, config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error.message, dnError);
          next();
        });
  });

  it('should reject if newrdn is not a string', (next) => {
    ldapAsyncWrap
        .rename(config.ldapRename.dnChange, 1, config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error.message, newrdnError);
          next();
        });
  });

  it('should reject if newparent is not a string', (next) => {
    ldapAsyncWrap
        .rename(config.ldapRename.dnChange, config.ldapRename.newrdn, 1)
        .catch((error) => {
          should.deepEqual(error.message, newparentError);
          next();
        });
  });

  it('should reject if control is not an array or undefined', (next) => {
    ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, {test: 'test'})
        .catch((error) => {
          should.deepEqual(error.message, controlArrayError);
          next();
        });
  });

  it('should reject if control is not properly defined', (next) => {
    ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, [{test: 'test'}])
        .catch((error) => {
          should.deepEqual(error.message, controlPropError);
          next();
        });
  });

  it('should reject if dn not corectly defined', (next) => {
    ldapAsyncWrap
        .rename(badDn, config.ldapRename.newrdn, config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error.message, invalidDnSyntax);
          next();
        });
  });

  it('should reject if newparent not corectly defined', (next) => {
    ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn, badNewParent)
        .catch((error) => {
          should.deepEqual(error.message, invalidDnSyntax);
          next();
        });
  });

  it('should reject if dn not corectly defined', (next) => {
    ldapAsyncWrap
        .rename(
            notCorectDefinedDn, config.ldapRename.newrdn,
            config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error.message, UnwillingToPerform);
          next();
        });
  });

  it('should reject if newparent not corectly defined', (next) => {
    ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            notCorectDefinedNewParent)
        .catch((error) => {
          should.deepEqual(error.message, affectMultipleDsas);
          next();
        });
  });

  it('should reject if the state is not BOUND', (next) => {
    ldapAsyncWrap.unbind()
    .then(() => {
      ldapAsyncWrap
          .rename(
              config.ldapRename.dnChange, config.ldapRename.newrdn,
              config.ldapRename.newparent)
          .catch((error) => {
            should.deepEqual(error.message, resStateRequired);
            next();
          });
    });
  });

  it('should reject if dn don\'t exist ', (next) => {
    ldapAsyncWrap
        .rename(
            existDn, config.ldapRename.newrdn, config.ldapRename.newparent,
            controlOperation)
        .catch((error) => {
          should.deepEqual(error.message, noSuchObject);
          next();
        });
  });

  it('should make the modification of dn', (next) => {
    // If you run multiple time remember to change the ldapRename from config.json
    ldapAsyncWrap
        .rename(
          config.ldapRename.dnChange, config.ldapRename.newrdn, config.ldapRename.newparent,
            controlOperation)
        .then((result) => {
          let resultOperation;
          resultOperation = result.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          should.deepEqual(resultOperation, ` ${config.ldapRename.dnChange}`);
          next();
        });
  });

});
