'use strict';

const Promise = require('bluebird');
const validator = require('tv4');
const changeSchema = require('../schemas/change_schema');
const controlSchema = require('../schemas/control_schema');
const ValidationError = require('./custom_errors.js');

/**
 * @module checkVariableFormat
 * @class CheckParam
 */
class CheckParam {
  /**
    * Verify the rename parameters.
    *
    * @method checkModifyChangeArray
    * @param {array} change The array for the parameters
    * @return Throws an error in case the provided arguments aren't strings
    */

  static checkParametersIfString() {
    let args = Array.from(arguments);
    args.forEach((element) => {
      if (typeof(element) !== 'string') {
        throw new TypeError('Wrong type');
      }
    });
  }

  /**
    * Verify the modify change parameter.
    *
    * @method checkModifyChangeArray
    * @param {array} change The json that is sent for verification
    * @return Throws error in case the json can't be validated
    */
  static checkModifyChangeArray(change) {
    if (Array.isArray(change) === false) {
      throw new TypeError('The json is not an array');
    } else {
      change.forEach((element) => {
        const result = validator.validateMultiple(element, changeSchema);
        if (result.valid !== true) {
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
    * @param {array} controls The jsonControl that is send for verification
    * @return Throws error in case the controls can't be validated.
    */
  static checkControlArray(controls) {
    if (controls !== undefined) {
      if (Array.isArray(controls) === false) {
        throw new TypeError('The control is not an array');
      } else {
        controls.forEach((element) => {
          const result = validator.validateMultiple(element, controlSchema);
          if (result.valid !== true) {
            throw new ValidationError(
                'Invalid control array', result.error, result.errors);
          }
        });
      }
    }
    // does nothing in case controls isn't defined.
  }
}

module.exports = CheckParam;