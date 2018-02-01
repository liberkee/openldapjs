'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapAliasError extends ServerError {

  static get code() {
    return 33;
  }

  get description() {
    return 'Indicates that an error occurred when an alias was dereferenced.';
  }

  get code() {
    return LdapAliasError.code;
  }


}

module.exports = LdapAliasError;
