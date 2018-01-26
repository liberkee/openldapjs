'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapNoSuchOperationError extends OperationalError {

  static get code() {
    return 119;
  }

  get description() {
    return 'This indicates that an attempt to cancel an operation via the cancel extended request was not successful because the server did not have any knowledge of the target operation. This often means that the server had already completed processing for the operation by the time it received and attempted to process the cancel request.';
  }

  get code() {
    return LdapNoSuchOperationError.code;
  }


}

module.exports = LdapNoSuchOperationError;
