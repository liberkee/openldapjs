import ServerError from './server_error';

export default class LdapBusyError extends ServerError {

  static get code(): number {
    return 51;
  }

  static get description(): string {
    return 'Indicates that the LDAP server is too busy to process the client request at this time but if the client waits and resubmits the request, the server may be able to process it then.';
  }

}
