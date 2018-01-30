import OperationalError from './operational_error';

export default class LdapProtocolError extends OperationalError {

  static get code(): number {
    return 2;
  }

  static get description(): string {
    return 'Indicates that the server has received an invalid or malformed request from the client.';
  }

}
