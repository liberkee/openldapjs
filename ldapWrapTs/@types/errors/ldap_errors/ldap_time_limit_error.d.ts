import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapTimeLimitError extends OperationalError {
}

export = LdapTimeLimitError;
