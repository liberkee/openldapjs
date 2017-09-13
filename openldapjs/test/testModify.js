'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const should = require('should');

describe('Testing the modify functionalities', () => {

  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

  const resStateRequired =
      'The operation failed. It could be done if the state of the client is BOUND';
  const resInvalidOp = 'Invalid Operation';
  const resJsonInvalid = 'The passed JSON is invalid';
  const resDnInvalid = 'The passed dn is invalid';

  const changeAttributesAdd = [
    {
      op: config.ldapModify.ldapModificationAdd.operation,
      attr: config.ldapModify.ldapModificationAdd.attribute,
      vals: config.ldapModify.ldapModificationAdd.vals,
    },
  ];

  const changeAttributesReplace = [
    {
      op: config.ldapModify.ldapModificationReplace.operation,
      attr: config.ldapModify.ldapModificationReplace.attribute,
      vals: config.ldapModify.ldapModificationReplace.vals,
    },
  ];

  const changeAttributesDelete = [
    {
      op: config.ldapModify.ldapModificationDelete.operation,
      attr: config.ldapModify.ldapModificationDelete.attribute,
      vals: config.ldapModify.ldapModificationDelete.vals,
    },
  ];

  const changeAttirbutes = [
    {
      op: config.ldapModify.ldapModificationReplace.operation,
      attr: config.ldapModify.ldapModificationReplace.attribute,
      vals: config.ldapModify.ldapModificationReplace.vals,
    },
    {
      op: config.ldapModify.ldapModificationAdd.operation,
      attr: config.ldapModify.ldapModificationAdd.attribute,
      vals: config.ldapModify.ldapModificationAdd.vals,
    },
    {
      op: config.ldapModify.ldapModificationDelete.operation,
      attr: config.ldapModify.ldapModificationDelete.attribute,
      vals: config.ldapModify.ldapModificationDelete.vals,
    },
  ];

  const controlOperation = [
    {
      oid: config.ldapControls.ldapModificationControlPostRead.oid,
      value: config.ldapControls.ldapModificationControlPostRead.value,
      iscritical:
          config.ldapControls.ldapModificationControlPostRead.iscritical,
    },
    {
      oid: config.ldapControls.ldapModificationControlPreRead.oid,
      value: config.ldapControls.ldapModificationControlPreRead.value,
      iscritical: config.ldapControls.ldapModificationControlPreRead.iscritical,
    },
  ];

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

    ldapAsyncWrap.initialize()
    .then(() => {
      ldapAsyncWrap
          .bind(
              config.ldapAuthentification.dnAdmin,
              config.ldapAuthentification.passwordAdmin)
          .then(() => { next(); });
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
      ldapAsyncWrap
          .newModify(
              config.ldapModify.ldapModificationReplace.change_dn,
              changeAttirbutes)
          .catch((error) => {
            should.deepEqual(error.message, resStateRequired);
            next();
          });
    });
  });

  it('should reject if attribute parameter is not defined', (next) => {
    const errorMSG = 'The json is not array';
    ldapAsyncWrap.newModify(config.ldapModify.ldapModificationReplace.change_dn)
        .catch((error) => {
          should.deepEqual(error.message, errorMSG);
          next();
        });
  });

  it('should reject operation if the attribute parameter is not corectly defined',
     (next) => {
       const errorMSG =
           'ValidationError: Missing required property: op,ValidationError: Missing required property: attr,ValidationError: Missing required property: vals';
       const attribute = [
         {
           add: 'add',
         },
       ];

       ldapAsyncWrap
           .newModify(
               config.ldapModify.ldapModificationReplace.change_dn, attribute)
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

    ldapAsyncWrap
        .newModify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttirbutes, control)
        .catch((error) => {
          should.deepEqual(error.message, errorMSG);
          next();
        });
  });

  it('should reject if the control parameter is not corectly defined', (next) => {
    const errorMSG =
        'ValidationError: Missing required property: oid,ValidationError: Missing required property: value,ValidationError: Missing required property: iscritical';
    const control = [{
      op: 'postread',
    }];
    ldapAsyncWrap
        .newModify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttirbutes, control)
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

  it('should replace the old attributes with new one from an entry', (next) => {
    ldapAsyncWrap
        .newModify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttributesReplace)
        .then((result) => {
          should.deepEqual(result, 0);
          next();
        });
  });

  it('should add a new attributes from an existing entry', (next) => {
    ldapAsyncWrap
        .newModify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttributesAdd)
        .then((result) => {
          should.deepEqual(result, 0);
          next();
        });
  });

  it('should delete an existing attribute from an entry', (next) => {
    ldapAsyncWrap
        .newModify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttributesDelete)
        .then((result) => {
          should.deepEqual(result, 0);
          next();
        });
  });

  it('should make multiple modification to an entry', (next) => {
    ldapAsyncWrap
        .newModify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttirbutes)
        .then((result) => {
          should.deepEqual(result, 0);
          next();
        });
  });

  it('should return the specific attribute from the entry', (next) => {
    ldapAsyncWrap
        .newModify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttirbutes, controlOperation)
        .then((result) => {
          let resultOperation;
          resultOperation = result.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          should.deepEqual(
              resultOperation,
              ` ${config.ldapModify.ldapModificationReplace.change_dn}`);
          next();
        });
  });

});
