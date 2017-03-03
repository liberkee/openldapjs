'use strict'

/**
 * @module ErrorHandling
 * @class ObjectHandlingError
 */


module.exports = class ObjectHandlingError {
  /**
   * Creates a new instance of the class ObjectHandlingError
   * 
   * @constructor
   * @param {int} errorId The id of the error
   */
  constructor(errorId) {
    const IdToErrorDictionary = {
      32: 'No Such Object',
    };

    const IdToTextDictionary = {
      32: 'This indicates that the client request targeted an entry that does not exist. Note that some servers use this result for a bind request that targets a nonexistent user, even though "invalid credentials" is a more appropriate result for that case.',
    }

    this.errorClassName = 'Object Handling Error';
    this.errorName = IdToErrorDictionary[errorId];
    this.errorText = IdToTextDictionary[errorId];
  }
}