'use strict';

import OperationalError = require('./operational_error');

class LdapAttributeExists extends OperationalError {

  static get code() {
    return 20;
  }

  static get description() {
    return 'Indicates that the attribute value specified in a modify or add operation already exists as a value for that attribute.';
  }

}

export = LdapAttributeExists;
