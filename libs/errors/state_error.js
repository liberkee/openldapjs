'use strict';

class StateError extends Error {

  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }

}

module.exports = StateError;
