'use strict';

import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

class LdapNoSuchAttributeError extends OperationalError {

  static get code() {
    return 16;
  }

  static get description() {
    return 'Indicates that the attribute specified in the modify or compare operation does not exist in the entry.';
  }

}

export = LdapNoSuchAttributeError;
