'use strict';

import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

class LdapAuthError extends LoginError {

  static get code() {
    return 7;
  }

  static get description() {
    return 'Indicates that during a bind operation the client requested ' +
    ' an authentication method not supported by the LDAP server.';
  }

}

export = LdapAuthError;
