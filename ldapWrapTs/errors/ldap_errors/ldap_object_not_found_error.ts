import OperationalError from './operational_error';

export default class LdapNotFoundError extends OperationalError {

  static get code(): number {
    return 32;
  }

  static get description(): string {
    return 'Indicates the target object cannot be found. This code is not returned on following operations: Search operations that find the search base but cannot find any entries that match the search filter. Bind operations.';
  }

}
