'use strict';

const LdapError = require('./ldap_error');
const LoginError = require('./login_error');

class LdapAccessError extends LoginError {

  static get code() {
    return 50;
  }

  get description() {
    return 'Indicates that the caller does not have sufficient rights to perform the requested operation.';
  }

  get code() {
    return 50;
  }


}

module.exports = LdapAccessError;
