'use strict';

const LdapAsyncWrap = require('../index').Client;
const config = require('./config.json');
const should = require('should');
const Promise = require('bluebird');
const errorHandler = require('../index').errorHandler;
const StateError = require('../libs/errors/state_error');
const ValidationError = require('../libs/errors/validation_error');
const errorCodes = require('../libs/error_codes');
const errorMessages = require('../libs/messages.json');

describe('Testing the modify functionalities', () => {

  let ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentication.host);

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
      attr: config.ldapModify.ldapModificationReplace.attribute,
      vals: config.ldapModify.ldapModificationReplace.vals,
    },
  ];

  const changeAttributes = [
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
      attr: config.ldapModify.ldapModificationAdd.attribute,
      vals: config.ldapModify.ldapModificationAdd.vals,
    },
  ];

  const controlOperation = [
    {
      oid: config.ldapControls.ldapModificationControlPostRead.oid,
      value: config.ldapControls.ldapModificationControlPostRead.value,
      isCritical:
        config.ldapControls.ldapModificationControlPostRead.isCritical,
    },
    {
      oid: config.ldapControls.ldapModificationControlPreRead.oid,
      value: config.ldapControls.ldapModificationControlPreRead.value,
      isCritical: config.ldapControls.ldapModificationControlPreRead.isCritical,
    },
  ];

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(config.ldapAuthentication.host);

    return ldapAsyncWrap.initialize()
      .then(() => {
        return ldapAsyncWrap.bind(
          config.ldapAuthentication.dnAdmin,
          config.ldapAuthentication.passwordAdmin);
      });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });

  it('should replace the old attributes with new one from an entry', () => {
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributesReplace)
      .then((result) => { should.deepEqual(result, 0); });
  });


  it('should reject if the state is not BOUND', () => {
    return ldapAsyncWrap.unbind()
      .then(() => {
        return ldapAsyncWrap.modify(
          config.ldapModify.ldapModificationReplace.change_dn,
          changeAttributes);
      })
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(StateError, (error) => {
        should.deepEqual(error.message, errorMessages.bindErrorMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should reject if attribute parameter is not defined', () => {
    return ldapAsyncWrap
      .modify(config.ldapModify.ldapModificationReplace.change_dn)
      .catch((error) => { should.deepEqual(error.message, errorMessages.invalidJSONMessage); });
  });

  it('should reject operation if the attribute parameter is not correctly defined', () => {

    const attribute = [
      {
        add: 'add',
      },
    ];

    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn, attribute)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(ValidationError, (error) => {
        should.deepEqual(error.message, errorMessages.invalidJSONMessage);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should modify if control parameter is just a single object', () => {
    const control = {
      oid: config.ldapControls.ldapModificationControlPostRead.oid,
      value: config.ldapControls.ldapModificationControlPostRead.value,
      isCritical:
        config.ldapControls.ldapModificationControlPostRead.isCritical,
    };
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributes, control)
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

  it('should reject if the control parameter is not correctly defined', () => {
    const control = [{
      op: 'postread',
    }];
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributes, control)
      .then(() => {
        should.fail('should not have succeeded');
      })
      .catch(ValidationError, (error) => {
        should.deepEqual(error.message, errorMessages.controlPropError);
      })
      .catch((err) => {
        should.fail('did not expect generic Error');
      });
  });

  it('should reject operation if the dn is empty', () => {
    const CustomError = errorHandler(errorCodes.unwillingToPerform);
    return ldapAsyncWrap.modify('', changeAttributes)
      .then(() => {
        should.fail('should not have passed');
      })
      .catch(CustomError, (error) => {
        should.deepEqual(error, new CustomError(errorMessages.ldapModifyErrorMessage));
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });


  it('should add new attributes to an existing entry', () => {
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributesAdd)
      .then((result) => { should.deepEqual(result, 0); });
  });

  it('should reject if the value already exist', () => {
    const CustomError = errorHandler(errorCodes.typeOrValueExists);
    const changeAttribute = [
      {
        op: config.ldapModify.ldapModificationAdd.operation,
        attr: config.ldapModify.ldapModificationReplace.attribute,
        vals: config.ldapModify.ldapModificationReplace.vals,
      },
    ];
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributesAdd)
      .then((result) => { should.fail('should not have passed'); })
      .catch(CustomError, (err) => {
        should.deepEqual(err.constructor.description, CustomError.description);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject the change not respect the class rules', () => {
    const CustomError = errorHandler(errorCodes.objectClassViolation);
    const change = [
      {
        op: config.ldapModify.ldapModificationAdd.operation,
        attr: 'title',
        vals: ['Un titlu'],
      },
    ];
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        change)
      .then((result) => { should.fail('should not have passed'); })
      .catch(CustomError, (err) => {
        should.deepEqual(err.constructor.description, CustomError.description);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });

  it('should reject the change not respect the schema structure rules', () => {
    const CustomError = errorHandler(errorCodes.namingViolation);
    const change = [
      {
        op: config.ldapModify.ldapModificationReplace.operation,
        attr: 'cn',
        vals: ['sss'],
      },
    ];
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        change)
      .then((result) => { should.fail('should not have passed'); })
      .catch(CustomError, (err) => {
        should.deepEqual(err.constructor.description, CustomError.description);
      })
      .catch((err) => {
        should.fail('did not expect generic error');
      });
  });


  it('should delete an attribute from an existing entry', () => {
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributesDelete)
      .then((result) => { should.deepEqual(result, 0); });
  });

  it('should make multiple modifications to an entry', () => {
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributes)
      .then((result) => { should.deepEqual(result, 0); });
  });

  it('should modify in parallel', () => {
    const modify1 = ldapAsyncWrap.modify(
      config.ldapModify.ldapModificationReplace.change_dn, changeAttributes,
      controlOperation);
    const modify2 = ldapAsyncWrap.modify(
      config.ldapModify.ldapModificationReplace.change_dn, changeAttributes,
      controlOperation);
    const modify3 = ldapAsyncWrap.modify(
      config.ldapModify.ldapModificationReplace.change_dn, changeAttributes,
      controlOperation);
    const modify4 = ldapAsyncWrap.modify(
      config.ldapModify.ldapModificationReplace.change_dn, changeAttributes,
      controlOperation);
    const modify5 = ldapAsyncWrap.modify(
      config.ldapModify.ldapModificationReplace.change_dn, changeAttributes,
      controlOperation);

    return Promise
      .all([
        modify1,
        modify2,
        modify3,
        modify4,
        modify5,
      ])
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

  it('should return a specific attribute from the entry', () => {
    return ldapAsyncWrap
      .modify(
        config.ldapModify.ldapModificationReplace.change_dn,
        changeAttributes, controlOperation)
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
