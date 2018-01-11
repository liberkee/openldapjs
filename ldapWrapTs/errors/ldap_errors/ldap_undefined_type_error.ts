import OperationalError from './operational_error';

export default class LdapUndefinedTypeError extends OperationalError {

  static get code(): number {
    return 17;
  }

  static get description(): string {
    return 'Indicates that the attribute specified in the modify or add operation does not exist in the LDAP server\'s schema.';
  }

}
