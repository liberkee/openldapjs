import OperationalError from './operational_error';

export default class LdapRdnError extends OperationalError {

  static get code(): number {
    return 67;
  }

  static get description(): string {
    return 'Indicates that the modify operation attempted to remove an attribute value that forms the entry\'s relative distinguished name.';
  }

}
