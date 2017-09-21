'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config.json');
const should = require('should');
const Promise = require('bluebird');

describe('Testing the modify functionalities', () => {

  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

  const resStateRequired =
      'The operation failed. It could be done if the state of the client is BOUND';
  const resInvalidOp = 'Invalid Operation';
  const resJsonInvalid = 'The passed JSON is invalid';
  const resDnInvalid = 'The passed dn is invalid';
  const unwillingToPerform = 53;

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

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentification.host);

    return ldapAsyncWrap.initialize().then(() => {
      return ldapAsyncWrap.bind(
          config.ldapAuthentification.dnAdmin,
          config.ldapAuthentification.passwordAdmin);
    });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });


  it('should reject if the state is not BOUND', () => {
    return ldapAsyncWrap.unbind()
        .then(() => {
          return ldapAsyncWrap.modify(
              config.ldapModify.ldapModificationReplace.change_dn,
              changeAttirbutes);
        })
        .catch(
            (error) => { should.deepEqual(error.message, resStateRequired); });
  });

  it('should reject if attribute parameter is not defined', () => {
    const errorMSG = 'The json is not an array';
    return ldapAsyncWrap
        .modify(config.ldapModify.ldapModificationReplace.change_dn)
        .catch((error) => { should.deepEqual(error.message, errorMSG); });
  });

  it('should reject operation if the attribute parameter is not correctly defined',
     () => {
       const errorMSG =
           'ValidationError: Missing required property: op,ValidationError: Missing required property: attr,ValidationError: Missing required property: vals';
       const attribute = [
         {
           add: 'add',
         },
       ];

       return ldapAsyncWrap
           .modify(
               config.ldapModify.ldapModificationReplace.change_dn, attribute)
           .catch((error) => { should.deepEqual(error.message, errorMSG); });
     });

  it('should reject if control parameter is not an array', () => {
    const errorMSG = 'The control is not an array';
    const control = {
      op: 'postread',
    };

    return ldapAsyncWrap
        .modify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttirbutes, control)
        .catch((error) => { should.deepEqual(error.message, errorMSG); });
  });

  it('should reject if the control parameter is not correctly defined', () => {
    const errorMSG =
        'ValidationError: Missing required property: oid,ValidationError: Missing required property: value,ValidationError: Missing required property: iscritical';
    const control = [{
      op: 'postread',
    }];
    return ldapAsyncWrap
        .modify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttirbutes, control)
        .catch((error) => { should.deepEqual(error.message, errorMSG); });
  });

  it('should reject operation if the dn is empty', () => {
    return ldapAsyncWrap.modify('', changeAttirbutes).catch((error) => {
      should.deepEqual(error, unwillingToPerform);
    });
  });

  it('should replace the old attributes with new one from an entry', () => {
    return ldapAsyncWrap
        .modify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttributesReplace)
        .then((result) => { should.deepEqual(result, 0); });
  });

  it('should add a new attributes from an existing entry', () => {
    return ldapAsyncWrap
        .modify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttributesAdd)
        .then((result) => { should.deepEqual(result, 0); });
  });

  it('should delete an existing attribute from an entry', () => {
    return ldapAsyncWrap
        .modify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttributesDelete)
        .then((result) => { should.deepEqual(result, 0); });
  });

  it('should make multiple modification to an entry', () => {
    return ldapAsyncWrap
        .modify(
            config.ldapModify.ldapModificationReplace.change_dn,
            changeAttirbutes)
        .then((result) => { should.deepEqual(result, 0); });
  });

  it('should modify in paralel', () => {
    const modify1 = ldapAsyncWrap.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes,
        controlOperation);
    const modify2 = ldapAsyncWrap.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes,
        controlOperation);
    const modify3 = ldapAsyncWrap.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes,
        controlOperation);
    const modify4 = ldapAsyncWrap.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes,
        controlOperation);
    const modify5 = ldapAsyncWrap.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes,
        controlOperation);

    return Promise.all([modify1, modify2, modify3, modify4, modify5])
        .then((results) => {
          results.forEach((element) => {
            let resultOperation;
            resultOperation = element.split('\n');
            resultOperation = resultOperation[1].split(':');
            resultOperation = resultOperation[1];
            should.deepEqual(
                resultOperation,
                ` ${config.ldapModify.ldapModificationReplace.change_dn}`);
          });
        });
  });

  it('should return the specific attribute from the entry', () => {
    return ldapAsyncWrap
        .modify(
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
        });
  });

});
