import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapNoSuchAttributeError extends OperationalError {

}

export = LdapNoSuchAttributeError;