'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');

describe('Testing the Compare functionalities', () => {
  const hostAddress = config.ldapAuthentification.host;
  const dn = config.ldapAuthentification.dnAdmin;
  const password = config.ldapAuthentification.passwordAdmin;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const attr = config.ldapCompare.attribute;
  const val = config.ldapCompare.value;

  const nonVal = 'nonExistingValue';
  const nonAttr = 'nonExistingAttr';
  const nonObj = config.ldapCompare.invalidUser;
  const noPass = config.ldapCompare.invalidPassword;


  const bindErrorMessage =
      'The operation failed. It could be done if the state of the client is BOUND';
  const dnEntryError = new TypeError('Wrong type');

  const comparisonResTrue = 'The Comparison Result: true';
  const comparisonResFalse = 'The Comparison Result: false';
  const LDAP_UNDEFINED_TYPE = 17;
  const LDAP_NO_SUCH_OBJECT = 32;

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
    .then(
        () => { return ldapAsyncWrap.bind(dn, password); });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });


  it('should reject if dn is not string', () => {
    return ldapAsyncWrap.compare(1, attr, val)
    .catch((error) => {
      should.deepEqual(error, dnEntryError);
    });
  });

  it('should compare existing attribute', () => {
    return ldapAsyncWrap.compare(dn, attr, val)
    .then((result) => {
      should.deepEqual(result, comparisonResTrue);
    });
  });


  it('should compare not existing value for attribute', () => {
    return ldapAsyncWrap.compare(dn, attr, nonVal)
    .then((result) => {
      should.deepEqual(result, comparisonResFalse);
    });
  });


  it('should compare not existing attribute', () => {
    return ldapAsyncWrap.compare(dn, nonAttr, val)
    .catch((err) => {
      should.deepEqual(err, LDAP_UNDEFINED_TYPE);
    });
  });


  it('should compare not existing object', () => {
    return ldapAsyncWrap.compare(nonObj, attr, val)
    .catch((err) => {
      should.deepEqual(err, LDAP_NO_SUCH_OBJECT);
    });
  });


  it('should not compare with denied access', () => {
    const noAccessDn = config.ldapAuthentification.dnUser;
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
        .then(() => { return ldapAsyncWrap.bind(noAccessDn, password); })
        .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
        .catch(
            (err) => { should.deepEqual(err, LDAP_NO_SUCH_OBJECT); });
  });

  it('should not compare if the binding failed', () => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize()
        .then(() => { return ldapAsyncWrap.bind(dn, noPass); })
        .catch(() => { return ldapAsyncWrap.compare(dn, attr, val); })
        .catch((err) => { should.deepEqual(err, bindErrorMessage); });
  });

  it('should throw an error if the binding was not done before comparing',
     () => {
       ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

       return ldapAsyncWrap.initialize()
           .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
           .catch(
               (err) => { should.deepEqual(err, bindErrorMessage); });
     });


  it('should not compare if the client is unbound', () => {
    return ldapAsyncWrap.unbind()
        .then(() => { return ldapAsyncWrap.compare(dn, attr, val); })
        .catch((err) => { should.deepEqual(err, bindErrorMessage); });
  });

  it('should compare several identical sequential compares', () => {
    return ldapAsyncWrap.compare(dn, attr, val)
        .then((result1) => {
          should.deepEqual(result1, comparisonResTrue);
          return ldapAsyncWrap.compare(dn, attr, val);
        })
        .then((result2) => {
          should.deepEqual(result2, comparisonResTrue);
          return ldapAsyncWrap.compare(dn, attr, val);
        })
        .then((result3) => { should.deepEqual(result3, comparisonResTrue); });
  });


  it('should compare several different sequential compares with error cases',
     () => {
       return ldapAsyncWrap.compare(dn, attr, val)
           .then((result1) => {
             should.deepEqual(result1, comparisonResTrue);
             return ldapAsyncWrap.compare(dn, nonAttr, val);
           })
           .catch((err) => {
             should.deepEqual(err, LDAP_UNDEFINED_TYPE);
             return ldapAsyncWrap.compare(dn, attr, nonVal);
           })
           .then(
               (result3) => { should.deepEqual(result3, comparisonResFalse); });
     });

  it('should compare several parallel compares', () => {
    const firstCompare = ldapAsyncWrap.compare(dn, attr, val);
    const secondCompare = ldapAsyncWrap.compare(dn, attr, val);
    const thirdCompare = ldapAsyncWrap.compare(dn, attr, val);

    return Promise.all([firstCompare, secondCompare, thirdCompare])
        .then((values) => {
          should.deepEqual(values[0], comparisonResTrue);
          should.deepEqual(values[1], comparisonResTrue);
          should.deepEqual(values[2], comparisonResTrue);
        });
  });
});
