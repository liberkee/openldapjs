'use strict';

const errorHandler = require('./error_dispenser');


const LdapError = errorHandler(3);

const instance = new LdapError('Anything goes here?');

console.log(instance.constructor.description);
console.log(instance.constructor.code);
throw instance;
