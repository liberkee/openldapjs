'use strict';

const LdapError = require('./ldap_error');

class LdapInvalidSyntaxError extends LdapError {

  static get code() {
    return 21;
  }

  static get description() {
    return 'Indicates that the attribute value specified in an add, compare, or modify operation is an unrecognized or invalid syntax for the attribute.';
  }

}

module.exports = LdapInvalidSyntaxError;
