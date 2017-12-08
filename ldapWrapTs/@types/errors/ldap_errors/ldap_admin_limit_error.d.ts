import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapAdminLimitError extends ServerError {

}

export = LdapAdminLimitError;
