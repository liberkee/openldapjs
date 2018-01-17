import ServerError from './server_error';

export default class LdapAliasError extends ServerError {

  static get code(): number {
    return 33;
  }

  static get description(): string {
    return 'Indicates that an error occurred when an alias was dereferenced.';
  }

}
