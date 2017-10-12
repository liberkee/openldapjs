'use strict';

const LdapError = require('./ldap_error');

class LdapOtherError extends LdapError {

  static get code() {
    return 80;
  }

  static get description() {
    return 'Indicates an unknown error condition. This is the default value for NDS error codes which do not map to other LDAP error codes.';
  }

}

module.exports = LdapOtherError;
