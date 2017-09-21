'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const should = require('should');

describe('Testing the rename functionalities', () => {
  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

  const typeErrorMsg = 'Wrong type';
  const resStateRequired =
      'The operation failed. It could be done if the state of the client is BOUND';
  const controlArrayError = 'The control is not an array';
  const controlPropError =
      'ValidationError: Missing required property: oid,ValidationError: Missing required property: value,ValidationError: Missing required property: iscritical';
  const invalidDnSyntax = 34;
  const noSuchObject = 32;
  const badDn = 'not good dn';
  const badNewParent = 'not good dn';
  const existDn = 'cn=1,ou=users,o=myhost,dc=demoApp,dc=com';
  const notCorectDefinedDn = 'cn=admin';
  const notCorectDefinedNewParent = 'ou=users';
  const UnwillingToPerform = 53;
  const affectMultipleDsas = 71;

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

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

    return ldapAsyncWrap.initialize()
    .then(() => {
      return ldapAsyncWrap.bind(
          config.ldapAuthentification.dnAdmin,
          config.ldapAuthentification.passwordAdmin);
    });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });

  it('should reject if dn is not a string', () => {
    return ldapAsyncWrap
        .rename(1, config.ldapRename.newrdn, config.ldapRename.newparent)
        .catch((error) => { should.deepEqual(error.message, typeErrorMsg); });
  });

  it('should reject if newrdn is not a string', () => {
    return ldapAsyncWrap
        .rename(config.ldapRename.dnChange, 1, config.ldapRename.newparent)
        .catch((error) => { should.deepEqual(error.message, typeErrorMsg); });
  });

  it('should reject if newparent is not a string', () => {
    return ldapAsyncWrap
        .rename(config.ldapRename.dnChange, config.ldapRename.newrdn, 1)
        .catch((error) => { should.deepEqual(error.message, typeErrorMsg); });
  });

  it('should reject if control is not an array or undefined', () => {
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, {test: 'test'})
        .catch(
            (error) => { should.deepEqual(error.message, controlArrayError); });
  });

  it('should reject if control is not properly defined', () => {
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, [{test: 'test'}])
        .catch(
            (error) => { should.deepEqual(error.message, controlPropError); });
  });

  it('should reject if dn not corectly defined', () => {
    return ldapAsyncWrap
        .rename(badDn, config.ldapRename.newrdn, config.ldapRename.newparent)
        .catch(
            (error) => { should.deepEqual(error, invalidDnSyntax); });
  });

  it('should reject if newparent not corectly defined', () => {
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn, badNewParent)
        .catch(
            (error) => { should.deepEqual(error, invalidDnSyntax); });
  });

  it('should reject if dn not corectly defined', () => {
    return ldapAsyncWrap
        .rename(
            notCorectDefinedDn, config.ldapRename.newrdn,
            config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error, UnwillingToPerform);
        });
  });

  it('should reject if newparent not corectly defined', () => {
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            notCorectDefinedNewParent)
        .catch((error) => {
          should.deepEqual(error, affectMultipleDsas);
        });
  });

  it('should reject if the state is not BOUND', () => {
    return ldapAsyncWrap.unbind()
        .then(() => {
          return ldapAsyncWrap.rename(
              config.ldapRename.dnChange, config.ldapRename.newrdn,
              config.ldapRename.newparent);
        })
        .catch(
            (error) => { should.deepEqual(error.message, resStateRequired); });
  });

  it('should reject if dn don\'t exist ', () => {
    return ldapAsyncWrap
        .rename(
            existDn, config.ldapRename.newrdn, config.ldapRename.newparent,
            controlOperation)
        .catch((error) => { should.deepEqual(error, noSuchObject); });
  });

  it('should make the modification of dn', () => {
    // If you run multiple time remember to change the ldapRename from
    // config.json
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, controlOperation)
        .then((result) => {
          let resultOperation;
          resultOperation = result.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          should.deepEqual(resultOperation, ` ${config.ldapRename.dnChange}`);
        });
  });

});
