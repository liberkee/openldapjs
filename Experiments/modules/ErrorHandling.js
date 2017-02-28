'use strict'

const ConnectionHandlingError = require('./ConnectionHandlingError.js');
const AuthorizationError = require('./AuthorizationError.js');
const ObjectHandlingError = require('./ObjectHandlingError.js');
const AttributeHandlingError = require('./AttributeHandlingError.js');

module.exports = class ErrorHandling {

  constructor(errorId) {
    let errorClass;
    this.IdToErrorClassDictionary = {
      7: errorClass = new AuthorizationError(errorId),
      8: errorClass = new AuthorizationError(errorId),
      14: errorClass = new AuthorizationError(errorId),
      48: errorClass = new AuthorizationError(errorId),
      49: errorClass = new AuthorizationError(errorId),
      50: errorClass = new AuthorizationError(errorId),
      123: errorClass = new AuthorizationError(errorId), 

      10: errorClass = new ConnectionHandlingError(errorId),
      13: errorClass = new ConnectionHandlingError(errorId),
      51: errorClass = new ConnectionHandlingError(errorId),
      52: errorClass = new ConnectionHandlingError(errorId),
      53: errorClass = new ConnectionHandlingError(errorId),

      32: errorClass = new ObjectHandlingError(errorId),

      16: errorClass = new AttributeHandlingError(errorId),
      17: errorClass = new AttributeHandlingError(errorId),
      18: errorClass = new AttributeHandlingError(errorId),
      21: errorClass = new AttributeHandlingError(errorId),      
      
      default: ErrorNotSupported,
    };

    this.errorObject.errorClassName = errorClass.className;
    this.errorObject.errorName = errorClass.errorName;
    this.errorObject.errorText = errorClass.errorText;



    //this.errorClass = this.IdToErrorClassDictionary[errorId];

    //if (this.errorClass === 'ConnectionHandlingError') {
      //this.errorObj = new ConnectionHandlingError(errorId);
    //}

    //this.errorName = this.errorObj.errorName;
    //this.errorText = this.errorObj.errorText;
    
  }  
}
