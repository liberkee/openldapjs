import ServerError from './server_error';

export default class LdapUnwillingError extends ServerError {

  static get code(): number {
    return 53;
  }

  static get description(): string {
    return 'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.';
  }

}
