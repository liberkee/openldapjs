import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapLeafError extends OperationalError {

}

export = LdapLeafError;
