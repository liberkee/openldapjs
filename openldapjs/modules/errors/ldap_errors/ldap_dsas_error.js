'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');


class LdapDsasError extends OperationalError {

  static get code() {
    return 71;
  }

  static get description() {
    return 'Indicates that the modify DN operation moves the entry from one LDAP server to another and requires more than one LDAP server.';
  }

}

module.exports = LdapDsasError;
