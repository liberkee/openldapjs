import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapLoopError extends ServerError {

}

export = LdapLoopError;
