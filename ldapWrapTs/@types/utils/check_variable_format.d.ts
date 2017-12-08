
import Promise = require('bluebird');
import Ajv = require('ajv');
import _ = require('underscore');
import ValidationError = require('../errors/validation_error');

/**
 * @module checkVariableFormat
 * @class CheckParam
 */
declare class CheckParam {

  /**
    * Checks if the arguments provided are Strings.
    *
    * @method validateStrings
    * @return Throws an error in case the provided parameters aren't  valid
   * strings
    */

  static validateStrings(...arg:Array<string>):void;

  /**
    * Verify the modify change parameter.
    *
    * @method checkModifyChange
    * @param {Object || Array} changes parameter set for verification
    * @return Throws error in case the changes is not valid. Return the changes as
    * an array in case entry is valid
    */
  static checkModifyChange(changes:JSON):JSON;

  /**
    * Verify the control parameter.
    *
    * @method checkControl
    * @param {Object || Array} controls parameter set for verification
    * @return Throws error in case the controls is not valid with the schema
    * members. Return the array of control or null if the control is undefined.
    */
  static checkControl(controls:JSON):any

  /**
    * Verify the entry parameter.
    *
    * @method checkControlArray
    * @param {Object || Array} entry parameter set for verification
    * @return Throws error in case the entry is not valid. Return the entry as
    * an array in case entry is valid
    */
  static checkEntryObject(entry:JSON):JSON;
}
export = CheckParam;
