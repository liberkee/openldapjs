'use strict';

const Promise = require('bluebird');
const validator = require('tv4');
const _ = require('underscore');
const changeSchema = require('../schemas/change_schema');
const controlSchema = require('../schemas/control_schema');
const addEntrySchema = require('../schemas/add_entry_schema');
const ValidationError = require('../errors/validation_error');
const errorList = require('../../test/error_list.json');

/**
 * @module checkVariableFormat
 * @class CheckParam
 */
class CheckParam {

  /**
    * Checks if the arguments provided are Strings.
    *
    * @method validateStrings
    * @return Throws an error in case the provided parameters aren't  valid
   * strings
    */

  static validateStrings() {
    _.each(arguments, (element) => {
      if (!_.isString(element)) {
        throw new TypeError(errorList.typeErrorMessage);
      }
    });
  }

  /**
    * Verify the modify change parameter.
    *
    * @method checkModifyChange
    * @param {Object || Array} changes parameter set for verification
    * @return Throws error in case the changes is not valid. Return the changes as
    * an array in case entry is valid
    */
  static checkModifyChange(changes) {
    const changesAttr = !_.isArray(changes) ? [changes] : changes;
    changesAttr.forEach((element) => {
      const result = validator.validateMultiple(element, changeSchema);
      if (!result.valid) {
        throw new ValidationError(
          errorList.invalidJSONMessage, result.error, result.errors);
      }
    });
    return changesAttr;
  }

  /**
    * Verify the control parameter.
    *
    * @method checkControl
    * @param {Object || Array} controls parameter set for verification
    * @return Throws error in case the controls is not valid with the schema
    * members. Return the array of control or null if the control is undefined.
    */
  static checkControl(controls) {
    if (controls !== undefined) {
      const ctrls = !_.isArray(controls) ? [controls] : controls;
      ctrls.forEach((element) => {
        const result = validator.validateMultiple(element, controlSchema);
        if (!result.valid) {
          throw new ValidationError(
            errorList.controlPropError, result.error, result.errors);
        }
      });
      return ctrls;
    }
    return null;
  }

  /**
    * Verify the entry parameter.
    *
    * @method checkControlArray
    * @param {Object || Array} entry parameter set for verification
    * @return Throws error in case the entry is not valid. Return the entry as
    * an array in case entry is valid
    */
  static checkEntryObject(entry) {
    const entryAttr = !_.isArray(entry) ? [entry] : entry;

    entryAttr.forEach((element) => {
      const result = validator.validateMultiple(element, addEntrySchema);
      if (!result.valid) {
        throw new ValidationError(
          errorList.entryObjectError, result.error, result.errors);
      }
    });
    return entryAttr;
  }

}

module.exports = CheckParam;
