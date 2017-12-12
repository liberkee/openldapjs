'use strict';

import OperationalError = require('./operational_error');

class LdapObjectClassError extends OperationalError {

  static get code() {
    return 65;
  }

  static get description() {
    return 'Indicates that the add, modify, or modify DN operation violates the object class rules for the entry.' +
    ' For example, the following types of request return this error: The add or modify operation tries to add an entry without a value for a required attribute.' +
    ' The add or modify operation tries to add an entry with a value for an attribute which the class definition does not contain.' +
    ' The modify operation tries to remove a required attribute without removing the auxiliary class that defines the attribute as required.';
  }

}

export = LdapObjectClassError;
