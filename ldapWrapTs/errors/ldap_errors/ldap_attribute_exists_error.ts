import OperationalError from './operational_error';

export default class LdapAttributeExists extends OperationalError {

  static get code(): number {
    return 20;
  }

  static get description(): string {
    return 'Indicates that the attribute value specified in a modify or add operation already exists as a value for that attribute.';
  }

}
