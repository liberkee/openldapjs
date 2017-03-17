'use strict';

const LdapError = class LdapError extends Error {
  constructor(id) {
    super();
    this._errorClass = 'LdapError: ' + id;

  }
}

const AuthorizationError = class AuthorizationError extends LdapError {
  constructor(id) {
    super();
    this._error = 'Authorization failed'
    this._message = 'some error';
    //console.log(id);
  }
}

module.exports = class ErrorHandler {
  
  constructor(errorId) {
    const idToErrorDictionary = {
      7: new AuthorizationError(errorId),
    };
    const errorObject = idToErrorDictionary[errorId];
    return (errorObject);

    //return new Promise((resolve, reject) => {
    //  const errorObject = idToErrorDictionary[errorId];

      
    //})
  }

}

