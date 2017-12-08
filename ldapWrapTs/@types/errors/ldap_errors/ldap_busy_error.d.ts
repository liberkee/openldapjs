import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapBusyError extends ServerError {

}

export = LdapBusyError;
