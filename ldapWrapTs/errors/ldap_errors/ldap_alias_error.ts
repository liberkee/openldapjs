'use strict';

import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

class LdapAliasError extends ServerError {

  static get code() {
    return 33;
  }

  static get description() {
    return 'Indicates that an error occurred when an alias was dereferenced.';
  }

}

export = LdapAliasError;
