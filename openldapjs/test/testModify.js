'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');

describe('Testing the Compare functionalities', () => {
  const hostAddress = 'ldap://10.16.0.194:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dn = 'cn=newPointChildBLABLA,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';

  const resStateRequired = 'The operation failed. It could be done if the state of the client is BOUND';
  const resInvalidOp = 'Invalid Operation';
  const resJsonInvalid = 'The passed JSON is invalid';
  const resDnInvalid = 'The passed dn is invalid';

  const operationCommand = {
    addOP: 0,
    deleteOP: 1,
    replaceOp: 2,
  }

  const modAddNewAtt = {
    operation: operationCommand.addOP,
    modification: {
      description: 'A new description',
    },
  };

  const modDeleteExistentAtt = {
    operation: operationCommand.deleteOP,
    modification: {
      description: 'A new description',
    },
  };

  const modReplaceExistentAtt = {
    operation: operationCommand.replaceOp,
    modification: {
      description: 'A replace',
    },
  };

  const modJsonOpInvalid = {
    operation: 5,
    modification: {
      description: 'Replace an attribute',
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
      ldapAsyncWrap.modify(dn, modAddNewAtt)
      .catch((error) => {
        should.deepEqual(error.message, resStateRequired);
        next();
      });
    });
  });

  it('should reject operation is invalid', (next) => {
    ldapAsyncWrap.modify(dn, modJsonOpInvalid)
    .catch((error) => {
      should.deepEqual(error.message, '2');
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
    ldapAsyncWrap.modify(null, modAddNewAtt)
    .catch((error) => {
      should.deepEqual(error.message, resDnInvalid);
      next();
    });
  });

  it('should reject operation if the dn is empty', (next) => {
    ldapAsyncWrap.modify('', modAddNewAtt)
    .catch((error) => {
      should.deepEqual(error.message, resDnInvalid);
      next();
    });
  });

  it('should add a new attribute from an existing entry', (next) => {
    ldapAsyncWrap.modify(dn, modAddNewAtt)
    .then((result) => {
      should.deepEqual(result, 0);
      next();
    });
  });

  it('should replace an attribute from an entry', (next) => {
    ldapAsyncWrap.modify(dn, modDeleteExistentAtt)
    .then((result) => {
      should.deepEqual(result, 0);
      next();
    });
  });

  it('should delete an existing attribute from an entry', (next) => {
    ldapAsyncWrap.modify(dn, modReplaceExistentAtt)
    .then((result) => {
      should.deepEqual(result, 0);
      next();
    });
  });

});
