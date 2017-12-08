import LdapError = require('./ldap_error');
import ServerError = require('./server_error');

declare class LdapUnwillingError extends ServerError {

}

export = LdapUnwillingError;
