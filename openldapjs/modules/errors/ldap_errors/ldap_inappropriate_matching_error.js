'use strict';

const LdapError = require('./ldap_error');

class LdapMatchingError extends LdapError {

  static get code() {
    return 18;
  }

  static get description() {
    return 'Indicates that the matching rule specified in the search filter does not match a rule defined for the attribute\'s syntax.';
  }

}

module.exports = LdapMatchingError;
