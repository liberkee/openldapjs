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
    * Verify the modify change parameter.
    *
    * @method checkModifyChangeArray
    * @param {array} change The json that is send for verification
    * @return {Promise} The pormise will return succesfull if evrey element of
   * the json is defined corectly.
    * Reject if some of the element is not corect defined.
    */
  checkModifyChangeArray(change) {
      if (Array.isArray(change) === false) {
        throw new Error();
      } else {
        change.forEach((element) => {
          const result = validator(element, changeSchema);
          if (result.valid !== true) {
            throw new Error (result.errors || result.errors);
          }
        });
        return true;
      }
  }

  /**
    * Verify the control parameter.
    *
    * @method checkControlArray
    * @param {array} controls The jsonControl that is send for verification
    * @return {Promise} The pormise will return succesfull if evrey element of
   * the jsonControl is defined corectly.
    * Reject if some of the element is not corect defined.
    */
  checkControlArray(controls) {
    return new Promise((resolve, reject) => {
      if (Array.isArray(controls) === false) {
        reject(new Error('The controls is not array'));
      } else {
        controls.forEach((element) => {
          const result = validator(element, controlSchema);
          if (result.valid !== true) {
            reject(new Error(result.errors || result.error));
          }
        });
        resolve(true);
      }
    });
  }
}