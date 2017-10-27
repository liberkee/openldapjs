'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapAliasError extends ServerError {

  static get code() {
    return 33;
  }

  static get description() {
    return 'Indicates that an error occurred when an alias was dereferenced.';
  }

}

module.exports = LdapAliasError;
