'use strict';

const LdapError = require('./ldap_error');

class LdapAuthError extends LdapError {

  static get code() {
    return 7;
  }

  static get description() {
    return 'Indicates that during a bind operation the client requested ' +
    ' an authentication method not supported by the LDAP server.';
  }

}

module.exports = LdapAuthError;
