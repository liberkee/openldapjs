'use strict';

const LdapError = require('./ldap_error');

class LdapProtocolError extends LdapError {

  static get code() {
    return 2;
  }

  static get description() {
    return 'Indicates that the server has received an invalid or malformed request from the client.';
  }

}

module.exports = LdapProtocolError;
