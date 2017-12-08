import LdapError = require('./ldap_error');
import LoginError = require('./login_error');

declare class LdapStrongAuthRequired extends LoginError {

}

export = LdapStrongAuthRequired;
