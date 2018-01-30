import ServerError from './server_error';

export default class LdapAdminLimitError extends ServerError {

  static get code(): number {
    return 11;
  }

  static get description(): string {
    return 'Indicates that an LDAP server limit set by an administrative authority has been exceeded.';
  }

}
