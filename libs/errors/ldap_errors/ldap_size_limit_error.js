'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');


class LdapSizeLimitError extends OperationalError {

  static get code() {
    return 4;
  }

  get description() {
    return 'Indicates that in a search operation, the size limit specified by the client or the server' +
    ' has been exceeded. Incomplete results are returned.';
  }

  get code() {
    return LdapSizeLimitError.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapSizeLimitError;
