'use strict';

const LdapError = require('./ldap_error');

class LdapReferralError extends LdapError {

  static get code() {
    return 10;
  }

  static get description() {
    return 'Does not indicate an error condition. In LDAPv3, indicates that the server' +
    ' does not hold the target entry of the request, but that the servers in the referral field may.';
  }

}

module.exports = LdapReferralError;
