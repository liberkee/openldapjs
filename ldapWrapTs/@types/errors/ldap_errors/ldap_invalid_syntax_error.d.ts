import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapInvalidSyntaxError extends OperationalError {

}

export = LdapInvalidSyntaxError;