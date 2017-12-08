import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapAliasError extends ServerError {

}

export = LdapAliasError;
