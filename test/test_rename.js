'use strict';

const LdapAsyncWrap = require('../libs/ldap_async_wrap.js');
const config = require('./config.json');
const should = require('should');
const errorList = require('./error_list.json');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const ValidationError = require('../libs/errors/validation_error');
const StateError = require('../libs/errors/state_error');

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

  const pathToCert = config.ldapAuthentication.pathFileToCert;

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
      .catch(TypeError, (error) => {
        should.deepEqual(error.message, errorList.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newRdn is not a string', () => {
    return ldapAsyncWrap
      .rename(config.ldapRename.dnChange, 1, config.ldapRename.newparent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(TypeError, (error) => {
        should.deepEqual(error.message, errorList.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newParent is not a string', () => {
    return ldapAsyncWrap
      .rename(config.ldapRename.dnChange, config.ldapRename.newrdn, 1)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(TypeError, (error) => {
        should.deepEqual(error.message, errorList.typeErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should reject if control is not a valid control object', () => {
    return ldapAsyncWrap
      .rename(
        config.ldapRename.dnChange, config.ldapRename.newrdn,
        config.ldapRename.newparent, {test: 'test'})
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(ValidationError, (error) => {
        should.deepEqual(error.message, errorList.controlPropError);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
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
      .catch(ValidationError, (error) => {
        should.deepEqual(error.message, errorList.controlPropError);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if dn  incorrectly defined', () => {
    const badDn = 'bad dn';
    return ldapAsyncWrap
      .rename(badDn, config.ldapRename.newrdn, config.ldapRename.newparent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(errorHandler(errorList.invalidDnSyntax), (error) => {
        const CustomError = errorHandler(errorList.invalidDnSyntax);
        should.deepEqual(error, new CustomError(errorList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newparent  incorrectly defined', () => {
    const badNewParent = 'bad dn';
    const CustomError = errorHandler(errorList.invalidDnSyntax);
    return ldapAsyncWrap
      .rename(
        config.ldapRename.dnChange, config.ldapRename.newrdn, badNewParent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if dn  incorrectly defined', () => {
    const incorrectDefinedDn = 'cn=admin';
    const CustomError = errorHandler(errorList.unwillingToPerform);
    return ldapAsyncWrap
      .rename(
        incorrectDefinedDn, config.ldapRename.newrdn,
        config.ldapRename.newparent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject if newparent  incorrectly defined', () => {
    const incorrectDefinedNewParent = 'ou=users';
    const CustomError = errorHandler(errorList.affectMultipleDsas);
    return ldapAsyncWrap
      .rename(
        config.ldapRename.dnChange, config.ldapRename.newrdn,
        incorrectDefinedNewParent)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorList.ldapRenameErrorMessage));
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
      .catch(StateError, (error) => {
        should.deepEqual(error.message, errorList.bindErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should reject if dn doesn\'t exist ', () => {
    const existDn = 'cn=1,ou=users,o=myhost,dc=demoApp,dc=com';
    const CustomError = errorHandler(errorList.ldapNoSuchObject);
    return ldapAsyncWrap
      .rename(
        existDn, config.ldapRename.newrdn, config.ldapRename.newparent,
        controlOperation)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorList.ldapRenameErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should rename the dn', () => {
    const validEntry = [
      config.ldapAdd.firstAttr,
      config.ldapAdd.secondAttr,
      config.ldapAdd.lastAttr,
    ];

    ldapAsyncWrap.rename(config.ldapRename.dnChange, config.ldapRename.newrdn,
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
