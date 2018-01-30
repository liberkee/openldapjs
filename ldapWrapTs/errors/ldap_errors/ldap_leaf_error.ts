import OperationalError from './operational_error';

export default class LdapLeafError extends OperationalError {

  static get code(): number {
    return 35;
  }

  static get description(): string {
    return 'Indicates that the specified operation cannot be performed on a leaf entry. (This code is not currently in the LDAP specifications, but is reserved for this constant.';
  }

}
