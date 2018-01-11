import LdapError from './ldap_error';

export default class LdapReferralError extends LdapError {

  static get code(): number {
    return 10;
  }

  static get description(): string {
    return 'Does not indicate an error condition. In LDAPv3, indicates that the server' +
    ' does not hold the target entry of the request, but that the servers in the referral field may.';
  }

}
