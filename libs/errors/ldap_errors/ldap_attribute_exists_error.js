'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');

class LdapAttributeExists extends OperationalError {

  static get code() {
    return 20;
  }

  get description() {
    return 'Indicates that the attribute value specified in a modify or add operation already exists as a value for that attribute.';
  }

  get code() {
    return LdapAttributeExists.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapAttributeExists;
