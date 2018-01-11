import ServerError from './server_error';

export default class LdapUnavailableError extends ServerError {

  static get code(): number {
    return 52;
  }

  static get description(): string {
    return 'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.';
  }

}
