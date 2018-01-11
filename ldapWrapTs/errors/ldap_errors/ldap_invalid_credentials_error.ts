import LoginError from './login_error';

export default class LdapCredentialsError extends LoginError {

  static get code(): number {
    return 49;
  }

  static get description(): string {
    return 'Indicates that during a bind operation one of the following occurred: The client passed either an incorrect DN or password,' +
    ' or the password is incorrect because it has expired, intruder detection has locked the account, or another similar reason. See the data code for more information.';
  }

}
