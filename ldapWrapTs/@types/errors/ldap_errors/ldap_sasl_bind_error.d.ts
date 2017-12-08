import LdapError = require('./ldap_error');

declare class LdapBindInProgressError extends LdapError {
  
}

export = LdapBindInProgressError;
