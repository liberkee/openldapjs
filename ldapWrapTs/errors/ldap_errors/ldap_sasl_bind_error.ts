import LdapError from './ldap_error';

export default class LdapBindInProgressError extends LdapError {

  static get code(): number {
    return 14;
  }

  static get description(): string {
    return 'Does not indicate an error condition, but indicates that the server is ready for the next step in the process.' +
    ' The client must send the server the same SASL mechanism to continue the process.';
  }

}
