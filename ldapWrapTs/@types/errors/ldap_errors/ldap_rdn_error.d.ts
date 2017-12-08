import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapRdnError extends OperationalError {

}

export = LdapRdnError;
