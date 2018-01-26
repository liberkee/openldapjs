'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapAdminLimitError extends ServerError {

  static get code() {
    return 11;
  }

  get description() {
    return 'Indicates that an LDAP server limit set by an administrative authority has been exceeded.';
  }

  get code() {
    return LdapAdminLimitError.code;
  }


}

module.exports = LdapAdminLimitError;
