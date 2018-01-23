'use strict';

const LdapError = require('./ldap_error');
const LoginError = require('./login_error');

class LdapAuthError extends LoginError {

  static get code() {
    return 7;
  }

  get description() {
    return 'Indicates that during a bind operation the client requested ' +
    ' an authentication method not supported by the LDAP server.';
  }

  get code() {
    return LdapAuthError.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapAuthError;
