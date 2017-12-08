'use strict';

import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

class LdapConstraintError extends OperationalError {

  static get code() {
    return 19;
  }

  static get description() {
    return 'Indicates that the attribute value specified in a modify, add, or modify DN operation violates constraints placed on the attribute. The constraint can be one of size or content (string only, no binary).';
  }


}

export = LdapConstraintError;
