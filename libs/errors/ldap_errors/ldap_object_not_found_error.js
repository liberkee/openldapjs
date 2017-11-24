'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapNotFoundError extends OperationalError {

  static get code() {
    return 32;
  }

  static get description() {
    return 'Indicates the target object cannot be found. This code is not returned on following operations: Search operations that find the search base but cannot find any entries that match the search filter. Bind operations.';
  }

}

module.exports = LdapNotFoundError;
