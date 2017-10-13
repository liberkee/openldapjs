'use strict';

const LdapError = require('./ldap_error');

class LdapObjectClassModsError extends LdapError {

  static get code() {
    return 69;
  }

  static get description() {
    return 'Indicates that the modify operation attempted to modify the structure rules of an object class.';
  }

}

module.exports = LdapObjectClassModsError;
