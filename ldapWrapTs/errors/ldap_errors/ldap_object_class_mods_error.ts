import OperationalError from './operational_error';

export default class LdapObjectClassModsError extends OperationalError {

  static get code(): number {
    return 69;
  }

  static get description(): string {
    return 'Indicates that the modify operation attempted to modify the structure rules of an object class.';
  }

}
