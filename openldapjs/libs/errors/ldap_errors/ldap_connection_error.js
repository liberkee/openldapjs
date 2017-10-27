'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapConnectionError extends ServerError {

  static get code() {
    return -11;
  }

  static get description() {
    return 'Could not install TLS on this connection, check certificates please.';
  }

}

module.exports = LdapConnectionError;
