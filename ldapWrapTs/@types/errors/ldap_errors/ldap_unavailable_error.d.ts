import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapUnavailableError extends ServerError {

}

export = LdapUnavailableError;

