'use strict';

const LdapError = require('./ldap_error');

class LdapLeafError extends LdapError {

  static get code() {
    return 35;
  }

  static get description() {
    return 'Indicates that the specified operation cannot be performed on a leaf entry. (This code is not currently in the LDAP specifications, but is reserved for this constant.';
  }

}

module.exports = LdapLeafError;
