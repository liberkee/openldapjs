'use strict';

import OperationalError = require('./operational_error');

class LdapNonLeafError extends OperationalError {

  static get code() {
    return 66;
  }

  static get description() {
    return 'Indicates that the requested operation is permitted only on leaf entries.' +
    ' For example, the following types of requests return this error:The client requests a delete operation on a parent entry.' +
    ' The client request a modify DN operation on a parent entry.';
  }

}

export = LdapNonLeafError;
