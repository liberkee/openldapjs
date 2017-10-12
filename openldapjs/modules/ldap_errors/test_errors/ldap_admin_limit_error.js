'use strict';

const LdapError = require('./ldap_error');

class LdapAdminLimitError extends LdapError {

  static get code() {
    return 11;
  }

  static get description() {
    return 'Indicates that an LDAP server limit set by an administrative authority has been exceeded.';
  }

}

module.exports = LdapAdminLimitError;
