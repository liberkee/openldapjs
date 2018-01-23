'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapProtocolError extends OperationalError {

  static get code() {
    return 2;
  }

  get description() {
    return 'Indicates that the server has received an invalid or malformed request from the client.';
  }

  get code() {
    return LdapProtocolError.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapProtocolError;
