import OperationalError from './operational_error';

export default class LdapAlreadyExistsError extends OperationalError {

  static get code(): number {
    return 68;
  }

  static get description(): string {
    return 'Indicates that the add operation attempted to add an entry that already exists, or that the modify operation attempted to rename an entry to the name of an entry that already exists.';
  }

}
