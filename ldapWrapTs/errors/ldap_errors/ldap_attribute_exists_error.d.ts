import LdapError = require('./ldap_error');
import OperationalError = require('./operational_error');

declare class LdapAttributeExists extends OperationalError {

}

export = LdapAttributeExists;
