'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapUnavailableError extends ServerError {

  static get code() {
    return 52;
  }

  static get description() {
    return 'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.';
  }

  get code() {
    return LdapUnavailableError.code;
  }

}

module.exports = LdapUnavailableError;
