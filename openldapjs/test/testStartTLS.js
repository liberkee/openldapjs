'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const errList = require('./errorlist.json');

describe('Testing the async LDAP search ', () => {

  const host = config.ldapAuthentication.host;
  let adminLDAP = new LDAPWrap(host);

  const pathToCert = '/etc/ldap/ca_certs.pem';
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

  it('should reject if the credential is not correct', () => {
    const wrongCred = '/wrong/cred.pam';
    return adminLDAP.startTLS(wrongCred)
      .catch((error) => {
        should.deepEqual(error, errList.connectionError);
      });
  });

  it('should start a TLS communication', () => {
    return adminLDAP.startTLS(pathToCert)
      .then((res) => {
        should.deepEqual(res, undefined);
      });
  });

});
