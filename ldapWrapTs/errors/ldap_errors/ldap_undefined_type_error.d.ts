import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapUndefinedTypeError extends OperationalError {
}

export = LdapUndefinedTypeError;
