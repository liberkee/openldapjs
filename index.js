'use strict';

const LdapClient = require('./libs/ldap_async_wrap');
const errorHandler = require('./libs/errors/error_dispenser').errorFunction;
const errorList = require('./libs/errors/error_dispenser').errorList;

/**
 * Library export object
 * @argument LdapClient - Library constructor to be exported and used with new()
 * @argument errorHandler - Custom error dispenser for the library.
 *  Wraps ldap errors in custom js error objects.
 * @argument errorList - List of all mapped ldap errors
 * 
 */

module.exports = {
  Client: LdapClient,
  errorHandler: errorHandler,
  errorList: errorList,
};
