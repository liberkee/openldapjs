import OperationalError from './operational_error';

export default class LdapNoSuchAttributeError extends OperationalError {

  static get code(): number {
    return 16;
  }

  static get description(): string {
    return 'Indicates that the attribute specified in the modify or compare operation does not exist in the entry.';
  }

}
