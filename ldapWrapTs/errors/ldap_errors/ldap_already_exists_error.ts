'use strict';

import OperationalError = require('./operational_error');

class LdapAlreadyExistsError extends OperationalError {

  static get code() {
    return 68;
  }

  static get description() {
    return 'Indicates that the add operation attempted to add an entry that already exists, or that the modify operation attempted to rename an entry to the name of an entry that already exists.';
  }

}

export = LdapAlreadyExistsError;
