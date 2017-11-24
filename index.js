'use strict';

const LdapClient = require('./libs/ldap_async_wrap');
const errorHandler = require('./libs/errors/error_dispenser').errorFunction;
const errorList = require('./libs/errors/error_dispenser').errorList;

module.exports = {
  Client: LdapClient,
  errorHandler: errorHandler,
  errorList: errorList,
};
