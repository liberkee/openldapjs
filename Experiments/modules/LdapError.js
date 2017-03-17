'use strict'

//const ConnectionHandlingError = require('./ConnectionHandlingError_2')

module.exports = class LdapError extends Error {
  /**
   * Creates a new instance of the class ErrorHandling
   * 
   * @constructor
   * @param {int} errorId The id of the error
   */
  
  constructor() {

    //this._errorId = 0;
    const IdToErrorClassDictionary = {
      7: ConnectionHandlingError,
      /*8: new AuthorizationError(errorId),
      14: new AuthorizationError(errorId),
      48: new AuthorizationError(errorId),
      49: new AuthorizationError(errorId),
      50: new AuthorizationError(errorId),
      123: new AuthorizationError(errorId),*/

      10: 'ConnectionHandlingError',
      13: 'ConnectionHandlingError',
      51: 'ConnectionHandlingError',
      52: 'ConnectionHandlingError',
      53: 'ConnectionHandlingError',

      /*32: new ObjectHandlingError(errorId),

      16: new AttributeHandlingError(errorId),
      17: new AttributeHandlingError(errorId),
      18: new AttributeHandlingError(errorId),
      21: new AttributeHandlingError(errorId),*/
    };
    
  }

  /*handleLdapError(errorId) {
    this._errorId = errorId;
    const errorObject = new IdToErrorClassDictionary[this._errorId];
  }*/
}


//module.exports = LdapError;