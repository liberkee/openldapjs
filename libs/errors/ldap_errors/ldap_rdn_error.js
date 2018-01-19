'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');


class LdapRdnError extends OperationalError {

  static get code() {
    return 67;
  }

  static get description() {
    return 'Indicates that the modify operation attempted to remove an attribute value that forms the entry\'s relative distinguished name.';
  }

  get code() {
    return LdapRdnError.code;
  }

}

module.exports = LdapRdnError;
