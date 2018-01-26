'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapLeafError extends OperationalError {

  static get code() {
    return 35;
  }

  get description() {
    return 'Indicates that the specified operation cannot be performed on a leaf entry. (This code is not currently in the LDAP specifications, but is reserved for this constant.';
  }

  get code() {
    return LdapLeafError.code;
  }


}

module.exports = LdapLeafError;
