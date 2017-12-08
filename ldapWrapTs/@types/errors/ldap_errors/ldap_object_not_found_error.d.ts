import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapNotFoundError extends OperationalError {

}

export = LdapNotFoundError;
