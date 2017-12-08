import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

declare class LdapAccessError extends LoginError {

}

export = LdapAccessError;
