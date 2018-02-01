'use strict';

const LdapAsyncWrap = require('../libs/ldap_async_wrap.js');
const should = require('should');
const config = require('./config.json');
const StateError = require('../libs/errors/state_error');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const errorCodes = require('../libs/error_codes');
const errorMessages = require('../libs/messages.json');

describe('Testing the Compare function', () => {
  const hostAddress = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const attr = config.ldapCompare.attribute;
  const val = config.ldapCompare.value;

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentication.host);

    return ldapAsyncWrap.initialize()
      .then(() => { return ldapAsyncWrap.bind(dn, password); });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });


  it('should reject if dn is not a string', () => {
    return ldapAsyncWrap.compare(1, attr, val)
      .then(() => { should.fail('should not have succeeded'); })
      .catch(
        TypeError,
        (error) => {
          should.deepEqual(error.message, errorMessages.typeErrorMessage);
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should compare existing attribute', () => {
    return ldapAsyncWrap.compare(dn, attr, val)
      .then((result) => {
        should.deepEqual(result, true);
      });
  });

  it('should fail if attribute doesn\'t exist in the objectclass', () => {
    const noSuchAttribute = 'title';
    const CustomError = errorHandler(errorCodes.noSuchAttirbute);
    return ldapAsyncWrap.compare(dn, noSuchAttribute, val)
      .then(() => { should.fail('should not have passed'); })
      .catch(
        CustomError,
        (err) => {
          should.deepEqual(
            err.constructor.description, CustomError.description);
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should compare non existing value for attribute', () => {
    const nonVal = 'nonExistingValue';
    return ldapAsyncWrap.compare(dn, attr, nonVal)
      .then((result) => {
        should.deepEqual(result, false);
      });
  });


  it('should  not compare non existing attribute', () => {
    const nonAttr = 'nonExistingAttr';
    const CustomError = errorHandler(errorCodes.undefinedType);
    return ldapAsyncWrap.compare(dn, nonAttr, val)
      .then(() => { should.fail('should not have succeeded'); })
      .catch(
        CustomError,
        (err) => {
          should.deepEqual(
            err, new CustomError(errorMessages.ldapCompareErrorMessage));
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });


  it('should not compare non existing object', () => {
    const nonObj = config.ldapCompare.invalidUser;
    const CustomError = errorHandler(errorCodes.ldapNoSuchObject);
    return ldapAsyncWrap.compare(nonObj, attr, val)
      .then(() => { should.fail('should not have succeeded'); })
      .catch(
        CustomError,
        (err) => {
          should.deepEqual(
            err, new CustomError(errorMessages.ldapCompareErrorMessage));
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });


  it('should not compare with access denied', () => {
    const noAccessDn = config.ldapAuthentication.dnUser;
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);
    const CustomError = errorHandler(errorCodes.ldapNoSuchObject);

    return ldapAsyncWrap.initialize()
      .then(() => {
        return ldapAsyncWrap.startTLS(pathToCert);
      })
      .then(() => { return ldapAsyncWrap.bind(noAccessDn, password); })
      .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
      .then(() => { should.fail('should not have succeeded'); })
      .catch(
        CustomError,
        (err) => {
          should.deepEqual(
            err, new CustomError(errorMessages.ldapCompareErrorMessage));
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should not compare if the binding failed', () => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
      .then(() => {
        const noPass = config.ldapCompare.invalidPassword;
        return ldapAsyncWrap.bind(dn, noPass);
      })
      .then(() => { should.fail('should not have succeeded'); })
      .catch(() => { return ldapAsyncWrap.compare(dn, attr, val); })
      .then(() => { should.fail('should not have succeeded'); })
      .catch(
        StateError,
        (err) => {
          should.deepEqual(err.message, errorMessages.bindErrorMessage);
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should throw an error if the binding was not done before comparing',
    () => {
      ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

      return ldapAsyncWrap.initialize()
        .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
        .then(() => { should.fail('should not have succeeded'); })
        .catch(
          StateError,
          (err) => {
            should.deepEqual(err.message, errorMessages.bindErrorMessage);
          })
        .catch((err) => { should.fail('did not expect generic error'); });
    });


  it('should not compare if the client is unbound', () => {
    return ldapAsyncWrap.unbind()
      .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
      .then(() => { should.fail('should not have succeeded'); })
      .catch(
        StateError,
        (err) => {
          should.deepEqual(err.message, errorMessages.bindErrorMessage);
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should compare several identical sequential compares', () => {
    return ldapAsyncWrap.compare(dn, attr, val)
      .then((result1) => {
        should.deepEqual(result1, true);
        return ldapAsyncWrap.compare(dn, attr, val);
      })
      .then((result2) => {
        should.deepEqual(result2, true);
        return ldapAsyncWrap.compare(dn, attr, val);
      })
      .then((result3) => { should.deepEqual(result3, true); });
  });


  it('should compare several different sequential compares with  error cases',
    () => {
      const nonVal = 'nonExistingValue';
      const nonAttr = 'nonExistingAttr';
      const CustomError = errorHandler(errorCodes.undefinedType);

      return ldapAsyncWrap.compare(dn, attr, val)
        .then((result1) => {
          should.deepEqual(result1, true);
          return ldapAsyncWrap.compare(dn, nonAttr, val);
        })
        .then(() => { should.fail('should not have succeeded'); })
        .catch(
          CustomError,
          (err) => {
            should.deepEqual(
              err, new CustomError(errorMessages.ldapCompareErrorMessage));
            return ldapAsyncWrap.compare(dn, attr, nonVal);
          })
        .catch(() => { should.fail('did not expect generic error'); })
        .then((result3) => { should.deepEqual(result3, false); });
    });

  it('should compare several parallel compares', () => {
    const firstCompare = ldapAsyncWrap.compare(dn, attr, val);
    const secondCompare = ldapAsyncWrap.compare(dn, attr, val);
    const thirdCompare = ldapAsyncWrap.compare(dn, attr, val);

    return Promise.all([firstCompare, secondCompare, thirdCompare])
      .then((values) => {
        should.deepEqual(values[0], true);
        should.deepEqual(values[1], true);
        should.deepEqual(values[2], true);
      });
  });
});
