'use strict';

import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

class LdapLoopError extends ServerError {

  static get code() {
    return 54;
  }

  static get description() {
    return 'Indicates that the client discovered an alias or referral loop, and is thus unable to complete this request.';
  }

}

export = LdapLoopError;
