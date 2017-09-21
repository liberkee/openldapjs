'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const should = require('should');
const errList = require('./errorlist.json');

describe('Testing the rename functionalities', () => {
  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

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

    return ldapAsyncWrap.initialize().then(() => {
      return ldapAsyncWrap.bind(
          config.ldapAuthentification.dnAdmin,
          config.ldapAuthentification.passwordAdmin);
    });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });

  it('should reject if dn is not a string', () => {
    return ldapAsyncWrap
        .rename(1, config.ldapRename.newrdn, config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error.message, errList.typeErrorMessage);
        });
  });

  it('should reject if newrdn is not a string', () => {
    return ldapAsyncWrap
        .rename(config.ldapRename.dnChange, 1, config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error.message, errList.typeErrorMessage);
        });
  });

  it('should reject if newparent is not a string', () => {
    return ldapAsyncWrap
        .rename(config.ldapRename.dnChange, config.ldapRename.newrdn, 1)
        .catch((error) => {
          should.deepEqual(error.message, errList.typeErrorMessage);
        });
  });

  it('should reject if control is not an array or undefined', () => {
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, {test: 'test'})
        .catch((error) => {
          should.deepEqual(error.message, errList.controlArrayError);
        });
  });

  it('should reject if control is not properly defined', () => {
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, [{test: 'test'}])
        .catch((error) => {
          should.deepEqual(error.message, errList.controlPropError);
        });
  });

  it('should reject if dn not corectly defined', () => {
    const badDn = 'not good dn';
    return ldapAsyncWrap
        .rename(badDn, config.ldapRename.newrdn, config.ldapRename.newparent)
        .catch(
            (error) => { should.deepEqual(error, errList.invalidDnSyntax); });
  });

  it('should reject if newparent not corectly defined', () => {
    const badNewParent = 'not good dn';
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn, badNewParent)
        .catch(
            (error) => { should.deepEqual(error, errList.invalidDnSyntax); });
  });

  it('should reject if dn not corectly defined', () => {
    const notCorectDefinedDn = 'cn=admin';
    return ldapAsyncWrap
        .rename(
            notCorectDefinedDn, config.ldapRename.newrdn,
            config.ldapRename.newparent)
        .catch((error) => {
          should.deepEqual(error, errList.unwillingToPerform);
        });
  });

  it('should reject if newparent not corectly defined', () => {
    const notCorectDefinedNewParent = 'ou=users';
    return ldapAsyncWrap
        .rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            notCorectDefinedNewParent)
        .catch(
            (error) => { should.deepEqual(error, errList.affectMutipleDsas); });
  });

  it('should reject if the state is not BOUND', () => {
    return ldapAsyncWrap.unbind()
        .then(() => {
          return ldapAsyncWrap.rename(
              config.ldapRename.dnChange, config.ldapRename.newrdn,
              config.ldapRename.newparent);
        })
        .catch((error) => {
          should.deepEqual(error.message, errList.bindErrorMessage);
        });
  });

  it('should reject if dn don\'t exist ', () => {
    const existDn = 'cn=1,ou=users,o=myhost,dc=demoApp,dc=com';
    return ldapAsyncWrap
        .rename(
            existDn, config.ldapRename.newrdn, config.ldapRename.newparent,
            controlOperation)
        .catch(
            (error) => { should.deepEqual(error, errList.ldapNoSuchObject); });
  });

  it('should make the modification of dn', () => {
    const validEntry = {
      objectClass: config.ldapAdd.objectClass,
      sn: config.ldapAdd.sn,
      description: config.ldapAdd.description,
    };

    return ldapAsyncWrap
        .delete(`${config.ldapRename.newrdn},${config.ldapRename.newparent}`)
        .then(() => {
          return ldapAsyncWrap.add(config.ldapRename.dnChange, validEntry);
        })
        .then(() => {
          return ldapAsyncWrap.rename(
              config.ldapRename.dnChange, config.ldapRename.newrdn,
              config.ldapRename.newparent, controlOperation);
        })
        .catch(() => {
          return ldapAsyncWrap.rename(
              config.ldapRename.dnChange, config.ldapRename.newrdn,
              config.ldapRename.newparent, controlOperation);
        })
        .then((result) => {
          let resultOperation;
          resultOperation = result.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          should.deepEqual(resultOperation, ` ${config.ldapRename.dnChange}`);
        });
  });

});
