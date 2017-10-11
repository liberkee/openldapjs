'use strict';

const LdapError = require('./ldap_error');

class LdapTimeLimitError extends LdapError {

  static get code() {
    return 3;
  }

  static get description() {
    return 'Indicates that the operation\'s time limit specified by either the client or the server' +
    ' has been exceeded. On search operations, incomplete results are returned.';
  }

}

module.exports = LdapTimeLimitError;
