'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const should = require('should');
const errList = require('./errorList.json');
const ErrorHandler = require('../modules/errors/error_dispenser');

describe('Testing the rename functionalities', () => {
  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentication.host);

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

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentication.host);

    return ldapAsyncWrap.initialize()
      .then(() => {
        return ldapAsyncWrap.bind(
          config.ldapAuthentication.dnAdmin,
          config.ldapAuthentication.passwordAdmin);
      });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });

  it('should reject if dn is not a string', () => {
    return ldapAsyncWrap
      .rename(1, config.ldapRename.newrdn, config.ldapRename.newparent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.typeErrorMessage);
      });
  });

  it('should reject if newRdn is not a string', () => {
    return ldapAsyncWrap
      .rename(config.ldapRename.dnChange, 1, config.ldapRename.newparent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.typeErrorMessage);
      });
  });

  it('should reject if newParent is not a string', () => {
    return ldapAsyncWrap
      .rename(config.ldapRename.dnChange, config.ldapRename.newrdn, 1)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.typeErrorMessage);
      });
  });

  it('should reject if control is not an array or undefined', () => {
    return ldapAsyncWrap
      .rename(
        config.ldapRename.dnChange, config.ldapRename.newrdn,
        config.ldapRename.newparent, {test: 'test'})
      .then(() => {
        should.fail('should not have passed');
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.controlArrayError);
      });
  });

  it('should reject if control is not properly defined', () => {
    return ldapAsyncWrap
      .rename(
        config.ldapRename.dnChange, config.ldapRename.newrdn,
        config.ldapRename.newparent, [{test: 'test'}])
      .then(() => {
        should.fail('should not have passed');
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.controlPropError);
      });
  });

  it('should reject if dn  incorrectly defined', () => {
    const badDn = 'bad dn';
    return ldapAsyncWrap
      .rename(badDn, config.ldapRename.newrdn, config.ldapRename.newparent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(ErrorHandler(errList.invalidDnSyntax), (error) => {
        const CustomError = ErrorHandler(errList.invalidDnSyntax);
        should.deepEqual(error, new CustomError(errList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newparent  incorrectly defined', () => {
    const badNewParent = 'bad dn';
    const CustomError = ErrorHandler(errList.invalidDnSyntax);
    return ldapAsyncWrap
      .rename(
        config.ldapRename.dnChange, config.ldapRename.newrdn, badNewParent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if dn  incorrectly defined', () => {
    const incorrectDefinedDn = 'cn=admin';
    const CustomError = ErrorHandler(errList.unwillingToPerform);
    return ldapAsyncWrap
      .rename(
        incorrectDefinedDn, config.ldapRename.newrdn,
        config.ldapRename.newparent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newparent  incorrectly defined', () => {
    const incorrectDefinedNewParent = 'ou=users';
    const CustomError = ErrorHandler(errList.affectMultipleDsas);
    return ldapAsyncWrap
      .rename(
        config.ldapRename.dnChange, config.ldapRename.newrdn,
        incorrectDefinedNewParent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if the state is not BOUND', () => {
    return ldapAsyncWrap.unbind()
      .then(() => {
        return ldapAsyncWrap.rename(
          config.ldapRename.dnChange, config.ldapRename.newrdn,
          config.ldapRename.newparent);
      })
      .then(() => {
        should.fail('should not have passed');
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.bindErrorMessage);
      });
  });

  it('should reject if dn doesn\'t exist ', () => {
    const existDn = 'cn=1,ou=users,o=myhost,dc=demoApp,dc=com';
    const CustomError = ErrorHandler(errList.ldapNoSuchObject);
    return ldapAsyncWrap
      .rename(
        existDn, config.ldapRename.newrdn, config.ldapRename.newparent,
        controlOperation)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should rename the dn',
    () => { // this looks like an over complicated unit test
      const validEntry = [
        config.ldapAdd.firstAttr,
        config.ldapAdd.secondAttr,
        config.ldapAdd.lastAttr,
      ];

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
        .catch(() => { // shouldn't we place catch at the end ?
          return ldapAsyncWrap.rename(
            config.ldapRename.dnChange, config.ldapRename.newrdn,
            config.ldapRename.newparent, controlOperation);
        })
        .then((result) => {
          let resultOperation;
          resultOperation = result.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          should.deepEqual(
            resultOperation, ` ${config.ldapRename.dnChange}`);
        });
    });

});
