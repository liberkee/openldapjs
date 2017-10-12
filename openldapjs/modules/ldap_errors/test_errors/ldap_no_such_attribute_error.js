'use strict';

const LdapError = require('./ldap_error');

class LdapNoSuchAttributeError extends LdapError {

  static get code() {
    return 16;
  }

  static get description() {
    return 'Indicates that the attribute specified in the modify or compare operation does not exist in the entry.';
  }

}

module.exports = LdapNoSuchAttributeError;
