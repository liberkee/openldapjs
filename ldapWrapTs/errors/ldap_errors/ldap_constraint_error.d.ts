import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapConstraintError extends OperationalError {

}

export = LdapConstraintError;
