import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapObjectClassModsError extends OperationalError {

}

export = LdapObjectClassModsError;
