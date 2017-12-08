'use strict';

import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

class LdapAccessError extends LoginError {

  static get code() {
    return 50;
  }

  static get description() {
    return 'Indicates that the caller does not have sufficient rights to perform the requested operation.';
  }

}

export = LdapAccessError;
