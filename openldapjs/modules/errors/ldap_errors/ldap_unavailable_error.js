'use strict';

const LdapError = require('./ldap_error');

class LdapUnavailableError extends LdapError {

  static get code() {
    return 52;
  }

  static get description() {
    return 'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.';
  }

}

module.exports = LdapUnavailableError;
