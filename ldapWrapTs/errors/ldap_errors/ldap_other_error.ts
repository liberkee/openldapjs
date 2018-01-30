import LdapError from './ldap_error';

export default class LdapOtherError extends LdapError {

  static get code(): number {
    return 80;
  }

  static get description(): string {
    return 'Indicates an unknown error condition. This is the default value for NDS error codes which do not map to other LDAP error codes.';
  }

}
