'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapConstraintError extends OperationalError {

  static get code() {
    return 19;
  }

  get description() {
    return 'Indicates that the attribute value specified in a modify, add, or modify DN operation violates constraints placed on the attribute. The constraint can be one of size or content (string only, no binary).';
  }
  get code() {
    return LdapConstraintError.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapConstraintError;
