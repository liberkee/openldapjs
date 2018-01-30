import ServerError from './server_error';

export default class LdapLoopError extends ServerError {

  static get code(): number {
    return 54;
  }

  static get description(): string {
    return 'Indicates that the client discovered an alias or referral loop, and is thus unable to complete this request.';
  }

}
