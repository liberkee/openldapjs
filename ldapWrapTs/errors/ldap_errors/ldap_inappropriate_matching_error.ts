import OperationalError from './operational_error';


export default class LdapMatchingError extends OperationalError {

  static get code(): number {
    return 18;
  }

  static get description(): string {
    return 'Indicates that the matching rule specified in the search filter does not match a rule defined for the attribute\'s syntax.';
  }

}
