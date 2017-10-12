'use strict';

const LdapError = require('./ldap_error');

class LdapAttributeExists extends LdapError {

  static get code() {
    return 20;
  }

  static get description() {
    return 'Indicates that the attribute value specified in a modify or add operation already exists as a value for that attribute.';
  }

}

module.exports = LdapAttributeExists;
