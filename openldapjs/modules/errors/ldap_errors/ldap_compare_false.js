'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');


class LdapCompareFalse extends OperationalError {

  static get code() {
    return 5;
  }

  static get description() {
    return 'Does not indicate an error condition.' +
    ' Indicates that the results of a compare operation are false.';
  }

}

module.exports = LdapCompareFalse;
