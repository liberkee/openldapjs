'use strict';

// const ErrorMaps = require('./error_maps.js');
const error = require('./error_object.js');
const _ = require('underscore');

let id = 80; // default errorID

class LdapError extends Error {

  constructor(errorId) {
    if (!_.isUndefined(error[errorId])) { // in case the error doesn't map to anything
      id = errorId;
    }
    super(error[id].Name);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.Description = error[id].Description;

  }

}

class LdapInitError extends LdapError {
  // anything different except the name ?
}

class LdapOperationError extends LdapError {

}

