'use strict';

const LdapError = require('./ldap_error');

class LdapAlreadyExistsError extends LdapError {

  static get code() {
    return 68;
  }

  static get description() {
    return 'Indicates that the add operation attempted to add an entry that already exists, or that the modify operation attempted to rename an entry to the name of an entry that already exists.';
  }

}

module.exports = LdapAlreadyExistsError;
