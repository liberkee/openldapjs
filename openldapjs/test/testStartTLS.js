'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const errList = require('./errorlist.json');

describe('Testing the async LDAP search ', () => {

  const host = config.ldapAuthentication.host;
  let adminLDAP = new LDAPWrap(host);

  const pathFileToCert = '/etc/ldap/ca_certs.pem';
  const pathToCert = '/etc/ldap';
  beforeEach(() => {
    adminLDAP = new LDAPWrap(host);

    return adminLDAP.initialize();
  });

  afterEach(() => {
    return adminLDAP.unbind();
  });

  it('should reject if the state is not Initialized', () => {
    return adminLDAP.unbind()
      .then(() => {
        return adminLDAP.startTLS(pathToCert);
      })
      .catch((error) => {
        should.deepEqual(error.message, errList.initializationErrorMessage);
      });
  });

  it('should reject if the path is wrong', () => {
    const wrongCred = '/wrong/cred.pam';
    return adminLDAP.startTLS(wrongCred)
      .catch((error) => {
        should.deepEqual(error, errList.connectionError);
      });
  });

  it('should reject if there are no certificate', () => {
    const wrongCred = '/etc';
    return adminLDAP.startTLS(wrongCred)
      .catch((error) => {
        should.deepEqual(error, errList.connectionError);
      });
  });

  it('should start a TLS communication with full pathFile of cert', () => {
    return adminLDAP.startTLS(pathFileToCert)
      .then((res) => {
        should.deepEqual(res, undefined);
      });
  });

  it('should start a TLS communication with path of cert', () => {
    return adminLDAP.startTLS(pathToCert)
      .then((res) => {
        should.deepEqual(res, undefined);
      });
  });

});
