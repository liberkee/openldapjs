'use strict'

const ConnectionHandlingError = require('./ConnectionHandlingError.js');

module.exports = class ErrorHandling {

  constructor(errorId) {
    this.IdToErrorClassDictionary = {
      7: AuthorizationError,
      8: AuthorizationError,
      14: AuthorizationError,
      48: AuthorizationError,
      49: AuthorizationError,
      50: AuthorizationError,
      123: AuthorizationError, 

      10: ConnectionHandlingError,
      13: ConnectionHandlingError,
      51: ConnectionHandlingError,
      52: ConnectionHandlingError,
      53: ConnectionHandlingError,

      32: ObjectHandlingError,

      4: AttributeHandlingError,

      
      
      default: ErrorNotSupported,
    };

    this.errorClass = this.IdToErrorClassDictionary[errorId];

    if (this.errorClass === 'ConnectionHandlingError') {
      this.errorObj = new ConnectionHandlingError(errorId);
    }

    this.errorName = this.errorObj.errorName;
    this.errorText = this.errorObj.errorText;
    
  }  
}
