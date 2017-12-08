import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapInvalidDnError extends OperationalError {

}

export = LdapInvalidDnError;
