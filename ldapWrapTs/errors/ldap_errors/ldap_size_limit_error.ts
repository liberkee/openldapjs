import OperationalError from './operational_error';

export default class LdapSizeLimitError extends OperationalError {

  static get code(): number {
    return 4;
  }

  static get description(): string {
    return 'Indicates that in a search operation, the size limit specified by the client or the server' +
    ' has been exceeded. Incomplete results are returned.';
  }

}
