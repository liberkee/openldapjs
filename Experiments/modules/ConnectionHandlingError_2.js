'use strict'

const LdapError = require('./LdapError');

class ConnectionHandlingError extends LdapError {
  constructor() {
    console.log(this._errorId);
  }
}