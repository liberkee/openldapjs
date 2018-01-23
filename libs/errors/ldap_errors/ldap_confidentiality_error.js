'use strict';

const LdapError = require('./ldap_error');

class LdapConfidentialityError extends LdapError {

  static get code() {
    return 13;
  }

  get description() {
    return 'Indicates that the session is not protected by a protocol such as Transport Layer Security (TLS), which provides session confidentiality.';
  }

  get code() {
    return LdapConfidentialityError.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapConfidentialityError;
