'use strict';

class LdapError extends Error {

  constructor(message) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor.name);
  }

  toString() {
    return `${this.code}:${this.description}`;
  }

}

module.exports = LdapError;
