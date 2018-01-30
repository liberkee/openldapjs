import OperationalError from './operational_error';

export default class LdapConstraintError extends OperationalError {

  static get code(): number {
    return 19;
  }

  static get description(): string {
    return 'Indicates that the attribute value specified in a modify, add, or modify DN operation violates constraints placed on the attribute. The constraint can be one of size or content (string only, no binary).';
  }

}
