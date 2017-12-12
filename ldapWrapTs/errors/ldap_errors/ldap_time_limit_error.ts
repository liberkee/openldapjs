'use strict';

import OperationalError = require('./operational_error');

class LdapTimeLimitError extends OperationalError {

  static get code() {
    return 3;
  }

  static get description() {
    return 'Indicates that the operation\'s time limit specified by either the client or the server' +
    ' has been exceeded. On search operations, incomplete results are returned.';
  }

}

export = LdapTimeLimitError;
