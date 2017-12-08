import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapObjectClassError extends OperationalError {

}

export = LdapObjectClassError;
