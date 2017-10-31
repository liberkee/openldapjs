'use strict';

const errorHandler = require('./error_dispenser');

const opError = require('./ldap_errors/operational_error');


const LdapError = errorHandler(1);

const instance = new LdapError('Anything goes here?');

throw instance;
