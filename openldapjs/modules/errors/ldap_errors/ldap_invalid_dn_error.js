'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapInvalidDnError extends OperationalError {

  static get code() {
    return 34;
  }

  static get description() {
    return 'Indicates that the syntax of the DN is incorrect. (If the DN syntax is correct, but the LDAP server\'s structure rules do not permit the operation, the server returns LDAP_UNWILLING_TO_PERFORM.';
  }

}

module.exports = LdapInvalidDnError;
