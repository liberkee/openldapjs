'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');


class LdapMatchingError extends OperationalError {

  static get code() {
    return 18;
  }

  static get description() {
    return 'Indicates that the matching rule specified in the search filter does not match a rule defined for the attribute\'s syntax.';
  }

}

module.exports = LdapMatchingError;
