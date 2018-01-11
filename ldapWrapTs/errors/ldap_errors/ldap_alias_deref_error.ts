import ServerError from './server_error';

export default class LdapAliasDerefError extends ServerError {

  static get code(): number {
    return 36;
  }

  static get description(): string {
    return 'Indicates that during a search operation, either the client does not have access rights to read the aliased object\'s name or dereferencing is not allowed.';
  }

}
