'use strict';

const LdapError = require('./ldap_error');

class LdapRdnError extends LdapError {

  static get code() {
    return 67;
  }

  static get description() {
    return 'Indicates that the modify operation attempted to remove an attribute value that forms the entry\'s relative distinguished name.';
  }

}

module.exports = LdapRdnError;
