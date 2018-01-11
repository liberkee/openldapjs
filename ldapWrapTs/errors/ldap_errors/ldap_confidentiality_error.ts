import LdapError from './ldap_error';

export default class LdapConfidentialityError extends LdapError {

  static get code(): number {
    return 13;
  }

  static get description(): string {
    return 'Indicates that the session is not protected by a protocol such as Transport Layer Security (TLS), which provides session confidentiality.';
  }

}
