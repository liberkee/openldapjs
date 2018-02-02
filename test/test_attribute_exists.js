'use strict';

const LdapAsyncWrap = require('../libs/ldap_async_wrap.js');
const should = require('should');
const config = require('./config.json');
const StateError = require('../libs/errors/state_error');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const errorCodes = require('../libs/error_codes');
const errorMessages = require('../libs/messages.json');

describe('Testing the attributeExists function', () => {
  const hostAddress = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const attr = config.ldapCompare.attribute;

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentication.host);

    return ldapAsyncWrap.initialize()
      .then(() => {
        return ldapAsyncWrap.bind(dn, password);
      });
  });

  afterEach(() => {
    return ldapAsyncWrap.unbind();
  });


  it('should return true if the attribute exists', () => {
    return ldapAsyncWrap.attributeExists(dn, attr)
      .then((res) => {
        res.should.be.true();
      });
  });

  it('should return false if the attribute don\'t exist', () => {
    const wrongAttr = 'ou';
    return ldapAsyncWrap.attributeExists(dn, wrongAttr)
      .then((res) => {
        res.should.be.false();
      });
  });

  it('should reject in case of an error', () => {
    const wrongDN = 'cn=wrong';
    const CustomError = errorHandler(errorCodes.ldapNoSuchObject);
    return ldapAsyncWrap.attributeExists(wrongDN, attr)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(CustomError, (err) => {
        should.deepEqual(
          err, new CustomError(errorMessages.ldapCompareErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

});
