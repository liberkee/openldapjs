'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const should = require('should');

describe('Testing the modify functionalities', () => {

  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

  const resStateRequired = 'The operation failed. It could be done if the state of the client is BOUND';
  const resInvalidOp = 'Invalid Operation';
  const resJsonInvalid = 'The passed JSON is invalid';
  const resDnInvalid = 'The passed dn is invalid';

  const changeAttributesAdd = [
    {
      op: config.ldapModificationReplace.operation,
      attr: config.ldapModificationReplace.attribute,
      vals: config.ldapModificationReplace.vals,
    },
  ];

  const changeAttributesReplace = [
    {
      op: config.ldapModificationAdd.operation,
      attr: config.ldapModificationAdd.attribute,
      vals: config.ldapModificationAdd.vals,
    },
  ];

  const changeAttributesDelete = [
    {
      op: config.ldapModificationDelete.operation,
      attr: config.ldapModificationDelete.attribute,
      vals: config.ldapModificationDelete.vals,
    },
  ];

  const changeAttirbutes = [
    {
      op: config.ldapModificationReplace.operation,
      attr: config.ldapModificationReplace.attribute,
      vals: config.ldapModificationReplace.vals,
    },
    {
      op: config.ldapModificationAdd.operation,
      attr: config.ldapModificationAdd.attribute,
      vals: config.ldapModificationAdd.vals,
    },
    {
      op: config.ldapModificationDelete.operation,
      attr: config.ldapModificationDelete.attribute,
      vals: config.ldapModificationDelete.vals,
    },
  ];

  const controlOperation = [
    {
      oid: config.ldapModificationControlPostRead.oid,
      value: config.ldapModificationControlPostRead.value,
      iscritical: config.ldapModificationControlPostRead.iscritical,
    },
    {
      oid: config.ldapModificationControlPreRead.oid,
      value: config.ldapModificationControlPreRead.value,
      iscritical: false,
    },
  ];

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

    ldapAsyncWrap.initialize()
      .then(() => {
        ldapAsyncWrap.bind(config.ldapAuthentification.dnAdmin,
                           config.ldapAuthentification.passwordAdmin)
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
        ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttirbutes)
          .catch((error) => {
            should.deepEqual(error.message, resStateRequired);
            next();
          });
      });
  });

  it('should reject if attribute parameter is not defined', (next) => {
    const errorMSG = 'The json is not array';
    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn)
      .catch((error) => {
        should.deepEqual(error.message, errorMSG);
        next();
      });
  });

  it('should reject operation if the attribute parameter is not corectly defined', (next) => {
    const errorMSG = 'ValidationError: Missing required property: op,ValidationError: Missing required property: attr,ValidationError: Missing required property: vals';
    const attribute = [
      {
        add: 'add',
      },
    ];

    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, attribute)
      .catch((error) => {
        should.deepEqual(error.message, errorMSG);
        next();
      });
  });

  it('should reject if control parameter is not an array', (next) => {
    const errorMSG = 'The controls is not array';
    const control = {
      op: 'postread',
    };

    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttirbutes, control)
      .catch((error) => {
        should.deepEqual(error.message, errorMSG);
        next();
      });
  });

  it('should reject if the control parameter is not corectly defined', (next) => {
    const errorMSG = 'ValidationError: Missing required property: oid,ValidationError: Missing required property: value,ValidationError: Missing required property: iscritical';
    const control = [{
      op: 'postread',
    }];
    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttirbutes, control)
      .catch((error) => {
        should.deepEqual(error.message, errorMSG);
        next();
      });
  });

  it('should reject operation if the dn is empty', (next) => {
    ldapAsyncWrap.newModify('', changeAttirbutes)
      .catch((error) => {
        should.deepEqual(error.message, '53');
        next();
      });
  });

  it('should add a new attributes from an existing entry', (next) => {
    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttributesAdd)
      .then((result) => {
        should.deepEqual(result, 0);
        next();
      });
  });

  it('should replace the old attributes with new one from an entry', (next) => {
    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttributesReplace)
      .then((result) => {
        should.deepEqual(result, 0);
        next();
      });
  });

  it('should delete an existing attribute from an entry', (next) => {
    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttributesDelete)
      .then((result) => {
        should.deepEqual(result, 0);
        next();
      });
  });

  it('should make multiple modification to an entry', (next) => {
    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttirbutes)
      .then((result) => {
        should.deepEqual(result, 0);
        next();
      });
  });

  it('should return the specific attribute from the entry', (next) => {
    ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn,
                            changeAttirbutes, controlOperation)
      .then((result) => {
        let resultOperation;
        resultOperation = result.split('\n');
        resultOperation = result[1].split(':');
        resultOperation = result[1];
        should.deepEqual(resultOperation, ` ${config.ldapModificationReplace.change_dn}`);
        next();
      });
  });

  it('should modify an entry in paralel', (next) => {
    for (let i = 0; i < 100; i += 1) {
      ldapAsyncWrap.newModify(config.ldapModificationReplace.change_dn, changeAttributesReplace)
        .then((result) => {
          should.deepEqual(result, 0);
        });
    }
    next();
  });

});
