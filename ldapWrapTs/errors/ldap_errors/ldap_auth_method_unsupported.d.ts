import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

declare class LdapAuthError extends LoginError {

}

export = LdapAuthError;
