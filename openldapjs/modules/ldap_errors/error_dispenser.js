'use strict';

const LdapError = require('./test_errors/ldap_error');
const LdapInvalidDnError = require('./test_errors/ldap_invalid_dn_error');
const LdapSizeLimitError = require('./test_errors/ldap_size_limit_error');
const LdapTimeLimitError = require('./test_errors/ldap_time_limit_error');
const LdapProtocolError = require('./test_errors/ldap_protocol_error');
const LdapInvalidSyntaxError = require('./test_errors/ldap_invalid_syntax_error');

const errors = {
  LdapInvalidDnError: LdapInvalidDnError,
  LdapSizeLimitError: LdapSizeLimitError,
  LdapTimeLimitError: LdapTimeLimitError,
  LdapProtocolError: LdapProtocolError,
  LdapInvalidSyntaxError: LdapInvalidSyntaxError,
};

function errorSelection(code) {

  const FoundErrorClassKey = Object.keys(errors)
    .find((key) => {
      const ClassCandidate = errors[key];
      return code === ClassCandidate.code;
    });

  const DesiredErrorClass = FoundErrorClassKey === undefined
    ? LdapError
    : errors[FoundErrorClassKey];

  return DesiredErrorClass;
}

module.exports = errorSelection;
