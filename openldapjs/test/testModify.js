'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');

describe('Testing the modify functionalities', () => {
  const hostAddress = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dn = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';

  const resStateRequired = 'The operation failed. It could be done if the state of the client is BOUND';
  const resInvalidOp = 'Invalid Operation';
  const resJsonInvalid = 'The passed JSON is invalid';
  const resDnInvalid = 'The passed dn is invalid';

  const modAddNewAtt = [
    {
    op: 'add',
    attr: 'description',
    vals: ['newDescription', 'secondNewDescription'],
  },
];

  const modDeleteExistentAtt = [{
    op: 'delete',
    attr: 'description',
    vals: ['newDescription'],
  },
];

  const modReplaceExistentAtt = [
    {
    op: 'replace',
    attr: 'description',
    vals: ['secondNewDescription', '2secondNewDescription'],
  },
];

  const modJsonOpInvalid = [
    {
      op: 'as',
      attr: 'description',
      vals: ['secondNewDescription', '2secondNewDescription'],
    },
  ];

  const modMultipleOp = [
    {
      op: 'add',
      attr: 'description',
      vals: ['123', '234'],
    },

    {
      op: 'delete',
      attr: 'description',
      vals: ['123'],
    },

    {
      op: 'replace',
      attr: 'description',
      vals: ['234', 'second234'],
    },
  ];  

  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    ldapAsyncWrap.initialize()
      .then(() => {
        console.log('it initializes');
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
      ldapAsyncWrap.newModify(dn, modAddNewAtt)
      .catch((error) => {
        should.deepEqual(error.message, resStateRequired);
        next();
      });
    });
  });

  it('should reject operation is invalid', (next) => {
    ldapAsyncWrap.newModify(dn, modJsonOpInvalid)
    .catch((error) => {
      should.deepEqual(error.message, '2');
      next();
    });
  });

  it('should reject operation if the mod JSON is null', (next) => {
    ldapAsyncWrap.newModify(dn, null)
    .catch((error) => {
      should.deepEqual(error.message, resJsonInvalid);
      next();
    });
  });

  it('should reject operation if the mod JSON is empty', (next) => {
    ldapAsyncWrap.newModify(dn, '')
    .catch((error) => {
      should.deepEqual(error.message, resJsonInvalid);
      next();
    });
  });

  it('should reject operation if the dn is null', (next) => {
    ldapAsyncWrap.newModify(null, modAddNewAtt)
    .catch((error) => {
      should.deepEqual(error.message, resDnInvalid);
      next();
    });
  });

  it('should reject operation if the dn is empty', (next) => {
    ldapAsyncWrap.newModify('', modAddNewAtt)
    .catch((error) => {
      should.deepEqual(error.message, resDnInvalid);
      next();
    });
  });

  it('should add a new attribute from an existing entry', (next) => {
    ldapAsyncWrap.newModify(dn, modAddNewAtt)
    .then((result) => {
      should.deepEqual(result, 0);
      next();
    })
  });

  it('should replace an attribute from an entry', (next) => {
    ldapAsyncWrap.newModify(dn, modDeleteExistentAtt)
    .then((result) => {
      should.deepEqual(result, 0);
      next();
    });
  });

  it('should delete an existing attribute from an entry', (next) => {
    ldapAsyncWrap.newModify(dn, modReplaceExistentAtt)
    .then((result) => {
      should.deepEqual(result, 0);
      next();
    });
  });

  it('should make multiple changes for an entry', (next) => {
    ldapAsyncWrap.newModify(dn, modMultipleOp)
    .then((result) => {
      should.deepEqual(result, 0);
      next();
    });
  });

});
