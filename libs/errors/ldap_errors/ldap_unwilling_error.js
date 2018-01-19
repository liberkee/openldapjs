'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapUnwillingError extends ServerError {

  static get code() {
    return 53;
  }

  static get description() {
    return 'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.';
  }

  get code() {
    return LdapUnwillingError.code;
  }

}

module.exports = LdapUnwillingError;
