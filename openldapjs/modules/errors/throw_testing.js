'use strict';

const errorHandler = require('./error_dispenser');


const LdapError = errorHandler(18);

const instance = new LdapError('Anything goes here?');

console.log(LdapError.description);
console.log(LdapError.code);
throw instance;
