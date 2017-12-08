import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapNamingError extends OperationalError {

}

export = LdapNamingError;