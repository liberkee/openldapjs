'use strict';

const LdapError = require('./ldap_error');

class LdapBindInProgressError extends LdapError {

  static get code() {
    return 14;
  }

  static get description() {
    return 'Does not indicate an error condition, but indicates that the server is ready for the next step in the process.' +
    ' The client must send the server the same SASL mechanism to continue the process.';
  }

}

module.exports = LdapBindInProgressError;
