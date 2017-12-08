'use strict';

import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

class LdapProtocolError extends OperationalError {

  static get code() {
    return 2;
  }

  static get description() {
    return 'Indicates that the server has received an invalid or malformed request from the client.';
  }

}

export = LdapProtocolError;
