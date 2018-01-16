import * as Ajv from 'ajv';
import * as _ from 'underscore';

import {IchangeSchema} from '../schemas/change_schema';
import {IcontrolSchema} from '../schemas/control_schema';
import {IaddEntrySchema} from '../schemas/add_entry_schema';
import {IupdateAttrSchema} from '../schemas/update_attr_schema';
import ValidationError from '../errors/validation_error';
import {RootObject} from '../messages';

let changeSchema:IchangeSchema = require('../schemas/change_schema.json');
let controlSchema:IcontrolSchema = require('../schemas/control_schema.json');
let addEntrySchema:IaddEntrySchema = require('../schemas/add_entry_schema.json');
let updateAttrSchema:IupdateAttrSchema = require('../schemas/update_attr_schema.json');
let errorMessages:RootObject = require('../messages.json');

const ajv: Ajv.Ajv = new Ajv();

/**
 * @module checkVariableFormat
 * @class CheckParam
 */
export default class CheckParam {

  /**
    * Checks if the arguments provided are Strings.
    *
    * @method validateStrings
    * @return Throws an error in case the provided parameters aren't  valid
   * strings
    */

  static validateStrings(...arg:Array<string>): void{
    _.each(arg, element => {
      if (!_.isString(element)) {
        throw new TypeError(errorMessages.typeErrorMessage);
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
  static checkModifyChange(changes:IchangeSchema): object[] {
    const changesAttr = !_.isArray(changes) ? [changes] : changes;
    const changeBuildArr:Array<object> = [];
    changesAttr.forEach(element => {
      const valid = ajv.validate(changeSchema, element);
      if (!valid) {
        throw new ValidationError(errorMessages.invalidJSONMessage, undefined, ajv.errors);
      }
      if (element.op === 'update') {
        const deleteVals:Array<string> = [];
        const addVals:Array<string> = [];

        element.vals.forEach((val) => {
          const validVal = ajv.validate(updateAttrSchema, val);
          if (!validVal) {
            throw new ValidationError(errorMessages.invalidJSONMessage, undefined, ajv.errors);
          } else {
            deleteVals.push(val.oldVal);
            addVals.push(val.newVal);
          }
        });

        const ldapDeleteObject = {
          op: 'delete',
          attr: element.attr,
          vals: deleteVals,
        };
        changeBuildArr.push(ldapDeleteObject);
        const ldapAddObject = {
          op: 'add',
          attr: element.attr,
          vals: addVals,
        };
        changeBuildArr.push(ldapAddObject);
      } else {
        changeBuildArr.push(element);
      }
    });
    return changeBuildArr;
  }

  /**
    * Verify the control parameter.
    *
    * @method checkControl
    * @param {Object || Array} controls parameter set for verification
    * @return Throws error in case the controls is not valid with the schema
    * members. Return the array of control or null if the control is undefined.
    */
  static checkControl(controls:Object | Array<Object>): Array<Object> | null {
    if (controls !== undefined) {
      const ctrls = !_.isArray(controls) ? [controls] : controls;
      ctrls.forEach(element => {
        const valid = ajv.validate(controlSchema, element);
        if (!valid) {
          throw new ValidationError(errorMessages.controlPropError, undefined, ajv.errors);
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
  static checkEntryObject(entry:Object | Array<Object>): Array<Object> {
    const entryAttr = !_.isArray(entry) ? [entry] : entry;

    entryAttr.forEach(element => {
      const valid = ajv.validate(addEntrySchema, element);
      if (!valid) {
        throw new ValidationError(errorMessages.entryObjectError, undefined, ajv.errors);
      }
    });
    return entryAttr;
  }

}