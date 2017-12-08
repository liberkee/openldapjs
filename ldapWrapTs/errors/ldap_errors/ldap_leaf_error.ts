'use strict';

import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

class LdapLeafError extends OperationalError {

  static get code() {
    return 35;
  }

  static get description() {
    return 'Indicates that the specified operation cannot be performed on a leaf entry. (This code is not currently in the LDAP specifications, but is reserved for this constant.';
  }

}

export = LdapLeafError;
