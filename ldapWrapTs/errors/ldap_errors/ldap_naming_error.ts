import OperationalError from './operational_error';

export default class LdapNamingError extends OperationalError {

  static get code(): number {
    return 64;
  }

  static get description(): string {
    return 'Indicates that the add or modify DN operation violates the schema\'s structure rules.' +
    ' For example,the request places the entry subordinate to an alias.' +
    ' The request places the entry subordinate to a container that is forbidden by the containment rules. The RDN for the entry uses a forbidden attribute type.';
  }

}
