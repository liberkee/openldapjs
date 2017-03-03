'use strict'

/**
 * @module ErrorHandling
 * @class ErrorHandling
 */

const ConnectionHandlingError = require('./ConnectionHandlingError.js');
const AuthorizationError = require('./AuthorizationError.js');
const ObjectHandlingError = require('./ObjectHandlingError.js');
const AttributeHandlingError = require('./AttributeHandlingError.js');

module.exports = class ErrorHandling {
  /**
   * Creates a new instance of the class ErrorHandling
   * 
   * @constructor
   * @param {int} errorId The id of the error
   */
  constructor(errorId) {
    
    const IdToErrorClassDictionary = {
      7: new AuthorizationError(errorId),
      8: new AuthorizationError(errorId),
      14: new AuthorizationError(errorId),
      48: new AuthorizationError(errorId),
      49: new AuthorizationError(errorId),
      50: new AuthorizationError(errorId),
      123: new AuthorizationError(errorId), 

      10: new ConnectionHandlingError(errorId),
      13: new ConnectionHandlingError(errorId),
      51: new ConnectionHandlingError(errorId),
      52: new ConnectionHandlingError(errorId),
      53: new ConnectionHandlingError(errorId),

      32: new ObjectHandlingError(errorId),

      16: new AttributeHandlingError(errorId),
      17: new AttributeHandlingError(errorId),
      18: new AttributeHandlingError(errorId),
      21: new AttributeHandlingError(errorId),      
    };

    const errorClass = IdToErrorClassDictionary[errorId];

    this.errorObject = new Object();

    this.errorObject.errorClassName = errorClass.errorClassName;
    this.errorObject.errorName = errorClass.errorName;
    this.errorObject.errorText = errorClass.errorText;
    
  }  
}
