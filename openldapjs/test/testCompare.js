'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');
const errList = require('./errorList.json');
const ErrorHandler = require('../modules/errors/error_dispenser');

describe('Testing the Compare functionalities', () => {
  const hostAddress = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const attr = config.ldapCompare.attribute;
  const val = config.ldapCompare.value;

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
      .then(
        () => { return ldapAsyncWrap.bind(dn, password); });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });


  it('should reject if dn is not a string', () => {
    return ldapAsyncWrap.compare(1, attr, val)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch((error) => { // dedicate error
        should.deepEqual(error.message, errList.typeErrorMessage);
      });
  });

  it('should compare existing attribute',
    () => { // rename it into should compare two attributes maybe ?
      return ldapAsyncWrap.compare(dn, attr, val)
        .then((result) => {
          should.deepEqual(result, errList.comparisonResTrue);
        });
    });


  it('should compare non existing value for attribute', () => {
    const nonVal = 'nonExistingValue';
    return ldapAsyncWrap.compare(dn, attr, nonVal)
      .then((result) => {
        // there is define a dedicate error for this resolve we 
        // can use that error or delete it because is not actually an error
        should.deepEqual(result, errList.comparisonResFalse);
      });
  });


  it('should compare non existing attribute', () => {
    const nonAttr = 'nonExistingAttr';
    const CustomError = ErrorHandler(errList.undefinedType);
    return ldapAsyncWrap.compare(dn, nonAttr, val)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errList.ldapCompareErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });


  it('should compare non existing object', () => {
    const nonObj = config.ldapCompare.invalidUser;
    const CustomError = ErrorHandler(errList.ldapNoSuchObject);
    return ldapAsyncWrap.compare(nonObj, attr, val)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errList.ldapCompareErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });


  it('should not compare with denied access', () => {
    const noAccessDn = config.ldapAuthentication.dnUser;
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);
    const CustomError = ErrorHandler(errList.ldapNoSuchObject);

    return ldapAsyncWrap.initialize()
      .then(() => { return ldapAsyncWrap.bind(noAccessDn, password); })
      .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(err, new CustomError(errList.ldapCompareErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should not compare if the binding failed', () => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
      .then(() => {
        const noPass = config.ldapCompare.invalidPassword;
        return ldapAsyncWrap.bind(dn, noPass);
      })
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(() => { return ldapAsyncWrap.compare(dn, attr, val); })
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch((err) => { // dedicate error?
        should.deepEqual(err.message, errList.bindErrorMessage);
      });
  });

  it('should throw an error if the binding was not done before comparing',
    () => {
      ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

      return ldapAsyncWrap.initialize()
        .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
        .then(() => {
          should.fail('should not have succeeded');
        })
        .catch((err) => { // dedicate error?
          should.deepEqual(err.message, errList.bindErrorMessage);
        });
    });


  it('should not compare if the client is unbound', () => {
    return ldapAsyncWrap.unbind()
      .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch((err) => { // dedicate error?
        should.deepEqual(err.message, errList.bindErrorMessage);
      });
  });

  it('should compare several identical sequential compares', () => {
    return ldapAsyncWrap.compare(dn, attr, val)
      .then((result1) => {
        should.deepEqual(result1, errList.comparisonResTrue);
        return ldapAsyncWrap.compare(dn, attr, val);
      })
      .then((result2) => {
        should.deepEqual(result2, errList.comparisonResTrue);
        return ldapAsyncWrap.compare(dn, attr, val);
      })
      .then((result3) => {
        should.deepEqual(result3, errList.comparisonResTrue);
      });
  });


  it('should compare several different sequential compares with error cases',
    () => {
      const nonVal = 'nonExistingValue';
      const nonAttr = 'nonExistingAttr';
      const CustomError = ErrorHandler(errList.undefinedType);
      return ldapAsyncWrap.compare(dn, attr, val)
        .then((result1) => {
          should.deepEqual(result1, errList.comparisonResTrue);
          return ldapAsyncWrap.compare(dn, nonAttr, val);
        })
        .then(() => {
          should.fail('should not have succeeded');
        })
        .catch(CustomError, (err) => {
          should.deepEqual(err, new CustomError(errList.ldapCompareErrorMessage));
          return ldapAsyncWrap.compare(dn, attr, nonVal);
        })
        .catch(() => {
          should.fail('did not expect generic error');
        })
        .then((result3) => {
          should.deepEqual(result3, errList.comparisonResFalse);
        });
    });

  it('should compare several parallel compares', () => {
    const firstCompare = ldapAsyncWrap.compare(dn, attr, val);
    const secondCompare = ldapAsyncWrap.compare(dn, attr, val);
    const thirdCompare = ldapAsyncWrap.compare(dn, attr, val);

    return Promise.all([firstCompare, secondCompare, thirdCompare])
      .then((values) => {
        should.deepEqual(values[0], errList.comparisonResTrue);
        should.deepEqual(values[1], errList.comparisonResTrue);
        should.deepEqual(values[2], errList.comparisonResTrue);
      });
  });
});
