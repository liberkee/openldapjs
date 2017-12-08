'use strict';

import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

class LdapInappropriateAuthError extends LoginError {

  static get code() {
    return 48;
  }

  static get description() {
    return 'Indicates that during a bind operation, the client is attempting to use an authentication method that the client cannot use correctly.' +
    ' For example, either of the following cause this error: The client returns simple credentials when strong credentials are required' +
    '...OR...The client returns a DN and a password for a simple bind when the entry does not have a password defined.';
  }

}

export = LdapInappropriateAuthError;
