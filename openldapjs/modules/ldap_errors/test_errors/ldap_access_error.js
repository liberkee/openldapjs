'use strict';

const LdapError = require('./ldap_error');

class LdapAccessError extends LdapError {

  static get code() {
    return 50;
  }

  static get description() {
    return 'Indicates that the caller does not have sufficient rights to perform the requested operation.';
  }

}

module.exports = LdapAccessError;
