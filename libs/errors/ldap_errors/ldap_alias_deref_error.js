'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');


class LdapAliasDerefError extends ServerError {

  static get code() {
    return 36;
  }

  static get description() {
    return 'Indicates that during a search operation, either the client does not have access rights to read the aliased object\'s name or dereferencing is not allowed.';
  }

  get code() {
    return LdapAliasDerefError.code;
  }


}

module.exports = LdapAliasDerefError;
