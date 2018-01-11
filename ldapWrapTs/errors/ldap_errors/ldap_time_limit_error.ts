import OperationalError from './operational_error';

export default class LdapTimeLimitError extends OperationalError {

  static get code(): number {
    return 3;
  }

  static get description(): string {
    return 'Indicates that the operation\'s time limit specified by either the client or the server' +
    ' has been exceeded. On search operations, incomplete results are returned.';
  }

}
