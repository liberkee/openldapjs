'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapFilterError extends ServerError {

  static get code() {
    return -7;
  }

  static get description() {
    return 'Indicate that the filter given is not defined correctly';
  }

}

module.exports = LdapFilterError;
