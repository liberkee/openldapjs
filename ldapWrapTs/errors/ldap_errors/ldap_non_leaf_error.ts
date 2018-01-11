import OperationalError from './operational_error';

export default class LdapNonLeafError extends OperationalError {

  static get code(): number {
    return 66;
  }

  static get description(): string {
    return 'Indicates that the requested operation is permitted only on leaf entries.' +
    ' For example, the following types of requests return this error:The client requests a delete operation on a parent entry.' +
    ' The client request a modify DN operation on a parent entry.';
  }

}
