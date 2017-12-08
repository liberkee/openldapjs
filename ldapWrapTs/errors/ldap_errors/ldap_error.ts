'use strict';

class LdapError extends Error {

  message:string;
  name:string;
  constructor(message:string) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, (<any>this).constructor.name);
  }

}

export = LdapError;
