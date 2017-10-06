'use strict';

class InitializeError extends Error {

  constructor(message, errorID) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

  }

}
