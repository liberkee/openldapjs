import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapAliasDerefError extends ServerError {

}

export = LdapAliasDerefError;
