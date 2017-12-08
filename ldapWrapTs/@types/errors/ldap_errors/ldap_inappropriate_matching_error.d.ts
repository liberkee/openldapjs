import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapMatchingError extends OperationalError {

}

export = LdapMatchingError;
