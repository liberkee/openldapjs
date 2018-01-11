import LoginError from './login_error';

export default class LdapAuthError extends LoginError {

  static get code(): number {
    return 7;
  }

  static get description(): string {
    return 'Indicates that during a bind operation the client requested ' +
    ' an authentication method not supported by the LDAP server.';
  }

}
