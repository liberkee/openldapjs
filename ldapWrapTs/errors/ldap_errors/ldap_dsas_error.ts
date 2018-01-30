import OperationalError from './operational_error';

export default class LdapDsasError extends OperationalError {

  static get code(): number {
    return 71;
  }

  static get description(): string {
    return 'Indicates that the modify DN operation moves the entry from one LDAP server to another and requires more than one LDAP server.';
  }

}
