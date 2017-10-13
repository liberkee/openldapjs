'use strict';

const LdapError = require('./ldap_error');

class LdapCompareTrue extends LdapError {

  static get code() {
    return 6;
  }

  static get description() {
    return 'Does not indicate an error condition.' +
    ' Indicates that the results of a compare operation are false.';
  }

}

module.exports = LdapCompareTrue;
