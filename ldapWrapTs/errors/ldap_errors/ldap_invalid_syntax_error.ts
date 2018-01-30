import OperationalError from './operational_error';

export default class LdapInvalidSyntaxError extends OperationalError {

  static get code(): number {
    return 21;
  }

  static get description(): string {
    return 'Indicates that the attribute value specified in an add, compare, or modify operation is an unrecognized or invalid syntax for the attribute.';
  }

}
