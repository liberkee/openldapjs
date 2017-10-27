'use strict';

const LdapError = require('./ldap_error');

class LdapOperationError extends LdapError {

  static get code() {
    return 1;
  }

  static get description() {
    return 'Indicates an internal error. The server is unable to respond with a more specific error and is also unable to properly respond to a request.' +
    ' It does not indicate that the client has sent an erroneous message.' +
    ' In NDS 8.3x through NDS 7.xx, this was the default error for NDS errors that did not map to an LDAP error code.' +
    ' To conform to the new LDAP drafts, NDS 8.5 uses 80 (0x50) for such errors.';
  }

}

module.exports = LdapOperationError;
