'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapNonLeafError extends OperationalError {

  static get code() {
    return 66;
  }

  get description() {
    return 'Indicates that the requested operation is permitted only on leaf entries.' +
    ' For example, the following types of requests return this error:The client requests a delete operation on a parent entry.' +
    ' The client request a modify DN operation on a parent entry.';
  }

  get code() {
    return LdapNonLeafError.code;
  }


}

module.exports = LdapNonLeafError;
