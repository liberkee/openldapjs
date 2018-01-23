'use strict';

const LdapError = require('./ldap_error');

class LdapReferralError extends LdapError {

  static get code() {
    return 10;
  }

  get description() {
    return 'Does not indicate an error condition. In LDAPv3, indicates that the server' +
    ' does not hold the target entry of the request, but that the servers in the referral field may.';
  }

  get code() {
    return LdapReferralError.code;
  }

  toString() {
    return `${this.code}:${this.description}`;
  }


}

module.exports = LdapReferralError;
