'use strict'

module.exports = class ObjectHandlingError {

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