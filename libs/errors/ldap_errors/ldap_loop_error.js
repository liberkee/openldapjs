'use strict';

const LdapError = require('./ldap_error');
const ServerError = require('./server_error');

class LdapLoopError extends ServerError {

  static get code() {
    return 54;
  }

  get description() {
    return 'Indicates that the client discovered an alias or referral loop, and is thus unable to complete this request.';
  }

  get code() {
    return LdapLoopError.code;
  }


}

module.exports = LdapLoopError;
