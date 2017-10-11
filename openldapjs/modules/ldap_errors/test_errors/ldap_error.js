'use strict';

class LdapError extends Error {

  constructor(message) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor.name);
  }

}

module.exports = LdapError;
