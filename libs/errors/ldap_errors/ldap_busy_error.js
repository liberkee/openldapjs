'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapBusyError extends ServerError {

  static get code() {
    return 51;
  }

  get description() {
    return 'Indicates that the LDAP server is too busy to process the client request at this time but if the client waits and resubmits the request, the server may be able to process it then.';
  }

  get code() {
    return LdapBusyError.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapBusyError;
