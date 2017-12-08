import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapDsasError extends OperationalError {

}

export = LdapDsasError;
