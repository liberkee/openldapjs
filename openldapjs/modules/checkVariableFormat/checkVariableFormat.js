'use strict';

const Promise = require('bluebird');
const validator = require('tv4');
const _ = require('underscore');
const changeSchema = require('../schemas/change_schema');
const controlSchema = require('../schemas/control_schema');
const addEntrySchema = require('../schemas/add_entry_schema');
const ValidationError = require('../errors/validation_error');

/**
 * @module checkVariableFormat
 * @class CheckParam
 */
class CheckParam {

  /**
    * Checks if the arguments provided are Strings.
    *
    * @method checkParametersIfString
    * @return Throws an error in case the provided parameters aren't strings
    */

  static checkParametersIfString() {
    const args = _.toArray(arguments);
    args.forEach((element) => {
      if (!_.isString(element)) {
        throw new TypeError('Expected String parameter');
      }
    });
  }

  /**
    * Verify the modify change parameter.
    *
    * @method checkModifyChangeArray
    * @param {Array} changes The Array of json Objects that is sent for
    * verification
    * @return Throws error in case the json can't be validated
    */
  static checkModifyChangeArray(changes) {
    if (!_.isArray(changes)) {
      throw new TypeError('The json is not an array');
    } else {
      changes.forEach((element) => {
        const result = validator.validateMultiple(element, changeSchema);
        if (!result.valid) {
          throw new ValidationError(
            'Invalid JSON', result.error, result.errors);
        }
      });
    }
  }

  /**
    * Verify the control parameter.
    *
    * @method checkControlArray
    * @param {Array} controls The jsonControl that is send for verification
    * @return Throws error in case the controls can't be validated.
    */
  static checkControlArray(controls) {
    if (controls !== undefined) {
      if (!_.isArray(controls)) {
        throw new TypeError('The control is not an array');
      } else {
        controls.forEach((element) => {
          const result = validator.validateMultiple(element, controlSchema);
          if (!result.valid) {
            throw new ValidationError(
              'Invalid control array', result.error, result.errors);
          }
        });
      }
    }
    // does nothing in case controls isn't defined.
  }

  /**
    * Verify the entry parameter.
    *
    * @method checkControlArray
    * @param {Object} entry The object that is sent for verification
    * @return Throws error in case the entry can't be validated.
    */
  static checkEntryObject(entry) {
    if (!_.isArray(entry)) {
      throw new TypeError('The entryObject is not an array');
    } else {
      entry.forEach((element) => {
        const result = validator.validateMultiple(element, addEntrySchema);
        if (!result.valid) {
          throw new ValidationError(
            'Invalid entryObject array', result.error, result.errors);
        }
      });
    }
  }

}

module.exports = CheckParam;
