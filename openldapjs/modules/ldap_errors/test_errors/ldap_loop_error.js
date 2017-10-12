'use strict';

const LdapError = require('./ldap_error');

class LdapLoopError extends LdapError {

  static get code() {
    return 54;
  }

  static get description() {
    return 'Indicates that the client discovered an alias or referral loop, and is thus unable to complete this request.';
  }

}

module.exports = LdapLoopError;
