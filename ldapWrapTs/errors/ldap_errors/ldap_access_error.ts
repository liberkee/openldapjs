import LoginError from './login_error';

export default class LdapAccessError extends LoginError {

  static get code(): number {
    return 50;
  }

  static get description(): string {
    return 'Indicates that the caller does not have sufficient rights to perform the requested operation.';
  }

}
