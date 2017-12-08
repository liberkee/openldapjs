import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

declare class LdapCredentialsError extends LoginError {

}

export = LdapCredentialsError;
