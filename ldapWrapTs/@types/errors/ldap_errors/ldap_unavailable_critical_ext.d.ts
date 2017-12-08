import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapCriticalExtensionError extends ServerError {

}

export = LdapCriticalExtensionError;
