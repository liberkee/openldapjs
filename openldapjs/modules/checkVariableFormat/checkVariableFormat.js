'use strict';

const Promise = require('bluebird');
const validator = require('../json_validator/json_validator');
const changeSchema = require('../schemas/change_schema');
const controlSchema = require('../schemas/control_schema');

/**
 * @module checkVariableFormat
 * @class checkParam
 */
module.exports = class checkParam {
  /**
    * Verify the rename parameters.
    *
    * @method checkModifyChangeArray
    * @param {array} change The array for the parameters
    * @return Throws an error in case the provided arguments aren't strings
    */

  checkParametersIfString(arrayParameter) {
    arrayParameter.forEach((element) => {
      if (typeof(element) !== 'string') {
        throw new Error(`The ${element} is not string`);
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
  checkModifyChangeArray(change) {
    if (Array.isArray(change) === false) {
      throw new Error('The json is not an array');
    } else {
      change.forEach((element) => {
        const result = validator(element, changeSchema);
        if (result.valid !== true) {
          throw new Error(result.errors || result.errors);
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
  checkControlArray(controls) {
    if (Array.isArray(controls) === false) {
      throw new Error('The controls is not array');
    } else {
      controls.forEach((element) => {
        const result = validator(element, controlSchema);
        if (result.valid !== true) {
          throw new Error(result.errors || result.errors);
        }
      });
    }
  }
}