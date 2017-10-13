'use strict';

const LdapError = require('./ldap_error');

class LdapConfidentialityError extends LdapError {

  static get code() {
    return 13;
  }

  static get description() {
    return 'Indicates that the session is not protected by a protocol such as Transport Layer Security (TLS), which provides session confidentiality.';
  }

}

module.exports = LdapConfidentialityError;
