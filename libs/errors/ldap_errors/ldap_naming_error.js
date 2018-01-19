'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapNamingError extends OperationalError {

  static get code() {
    return 64;
  }

  static get description() {
    return 'Indicates that the add or modify DN operation violates the schema\'s structure rules.' +
    ' For example,the request places the entry subordinate to an alias.' +
    ' The request places the entry subordinate to a container that is forbidden by the containment rules. The RDN for the entry uses a forbidden attribute type.';
  }

  get code() {
    return LdapNamingError.code;
  }

}

module.exports = LdapNamingError;
