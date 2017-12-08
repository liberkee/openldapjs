'use strict';

import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

class LdapUnwillingError extends ServerError {

  static get code() {
    return 53;
  }

  static get description() {
    return 'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.';
  }

}

export = LdapUnwillingError;
