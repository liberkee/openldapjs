'use strict';

const tv4 = require('tv4');
const formats = require('tv4-formats');

const validator = tv4.freshApi();
validator.addFormat(formats);


/**
 * @module json_validator
 * @class JsonValidator
 */
const validate = (msg, schema) => {
  return tv4.validateMultiple(msg, schema);
};


module.exports = validate;
