'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');

describe('Testing the Compare functionalities', () => {
  const hostAddress = 'ldap://10.16.0.194:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dn = 'dn:cn=newPointChildBLABLA4,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';

  const resStateRequired = 'The operation failed. It could be done if the state of the client is BOUND';
  const resInvalidOp = 'Invalid Operation';
  const resJsonInvalid = 'The passed JSON is invalid';
  const resDnInvalid = 'The passed dn is invalid';

  const modJson = {
    operation: 'add',
    modification: {
      objectClass: 'person',
      sn: 'newSN',
      description: 'OurNewObject',
    },
  };

  const modJsonOpInvalid = {
    operation: 'invalidOp',
    modification: {
      objectClass: 'person',
      sn: 'newSN',
      description: 'OurNewObject',
    },
  };

  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    ldapAsyncWrap.initialize()
      .then(() => {
        ldapAsyncWrap.bind(dnAdmin, password)
          .then(() => {
            next();
          });
      });
  });

  afterEach(() => {
    ldapAsyncWrap.unbind()
      .then(() => {

      });
  });


  it('should reject if the state is not BOUND', (next) => {
    ldapAsyncWrap.unbind()
    .then(() => {
      ldapAsyncWrap.modify(dn, modJson)
      .catch((error) => {
        should.deepEqual(error.message, resStateRequired);
        next();
      });
    });
  });

  it('should reject operation is invalid', (next) => {
    ldapAsyncWrap.modify(dn, modJsonOpInvalid)
    .catch((error) => {
      should.deepEqual(error.message, resInvalidOp);
      next();
    });
  });

  it('should reject operation if the mod JSON is null', (next) => {
    ldapAsyncWrap.modify(dn, null)
    .catch((error) => {
      should.deepEqual(error.message, resJsonInvalid);
      next();
    });
  });

  it('should reject operation if the mod JSON is empty', (next) => {
    ldapAsyncWrap.modify(dn, '')
    .catch((error) => {
      should.deepEqual(error.message, resJsonInvalid);
      next();
    });
  });

  it('should reject operation if the dn is null', (next) => {
    ldapAsyncWrap.modify(null, modJson)
    .catch((error) => {
      should.deepEqual(error.message, resDnInvalid);
      next();
    });
  });

  it('should reject operation if the dn is empty', (next) => {
    ldapAsyncWrap.modify('', modJson)
    .catch((error) => {
      should.deepEqual(error.message, resDnInvalid);
      next();
    });
  });

});
