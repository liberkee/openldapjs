'use strict';

const LdapError = require('./ldap_error');

class LdapSizeLimitError extends LdapError {

  static get code() {
    return 4;
  }

  static get description() {
    return 'Indicates that in a search operation, the size limit specified by the client or the server' +
    ' has been exceeded. Incomplete results are returned.';
  }

}

module.exports = LdapSizeLimitError;
