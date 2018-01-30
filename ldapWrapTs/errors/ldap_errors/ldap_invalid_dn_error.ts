import OperationalError from './operational_error';

export default class LdapInvalidDnError extends OperationalError {

  static get code(): number {
    return 34;
  }

  static get description(): string {
    return 'Indicates that the syntax of the DN is incorrect. (If the DN syntax is correct, but the LDAP server\'s structure rules do not permit the operation, the server returns LDAP_UNWILLING_TO_PERFORM.';
  }

}
