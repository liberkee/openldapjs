import ServerError from './server_error';

export default class LdapCriticalExtensionError extends ServerError {

  static get code(): number {
    return 12;
  }

  static get description(): string {
    return 'Indicates that the LDAP server was unable to satisfy a request because one or more critical' +
    ' extensions were not available. Either the server does not support the control or the control is not appropriate for the operation type.';
  }

}
