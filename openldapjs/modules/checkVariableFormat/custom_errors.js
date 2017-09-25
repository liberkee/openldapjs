'use strict';

class ValidationError extends Error {
  constructor(message, error, errors) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.error = error || errors;
  }
}

module.exports = ValidationError;