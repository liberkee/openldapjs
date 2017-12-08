import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

declare class LdapInappropriateAuthError extends LoginError {

}

export = LdapInappropriateAuthError;
