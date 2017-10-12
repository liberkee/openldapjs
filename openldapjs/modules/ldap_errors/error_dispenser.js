'use strict';

const LdapError = require('./test_errors/ldap_error');
const LdapInvalidDnError = require('./test_errors/ldap_invalid_dn_error');
const LdapSizeLimitError = require('./test_errors/ldap_size_limit_error');
const LdapTimeLimitError = require('./test_errors/ldap_time_limit_error');
const LdapProtocolError = require('./test_errors/ldap_protocol_error');
const LdapInvalidSyntaxError = require('./test_errors/ldap_invalid_syntax_error');
const LdapOperationError = require('./test_errors/ldap_operation_error');
const LdapCompareFalse = require('./test_errors/ldap_compare_false');
const LdapCompareTrue = require('./test_errors/ldap_compare_true');
const LdapAuthUnsupportedError = require('./test_errors/ldap_auth_method_unsupported');
const LdapStrongAuthError = require('./test_errors/ldap_strong_auth_error');
const LdapReferralError = require('./test_errors/ldap_referral_error');
const LdapAdminLimitError = require('./test_errors/ldap_admin_limit_error');
const LdapCriticalExtensionError = require('./test_errors/ldap_unavailable_critical_ext');
const LdapConfidentialityError = require('./test_errors/ldap_confidentiality_error');
const LdapSaslBindError = require('./test_errors/ldap_sasl_bind_error');
const LdapNoSuchAttribute = require('./test_errors/ldap_no_such_attribute_error');
const LdapUndefinedTypeError = require('./test_errors/ldap_undefined_type_error');
const LdapMatchingError = require('./test_errors/ldap_inappropriate_matching_error');
const LdapConstraintError = require('./test_errors/ldap_constraint_error');
const LdapTypeOrValueAlreadyExistsError = require('./test_errors/ldap_attribute_exists_error');
const LdapNoSuchObjectError = require('./test_errors/ldap_object_not_found_error');
const LdapAliasError = require('./test_errors/ldap_alias_error');
const LdapLeafError = require('./test_errors/ldap_leaf_error');
const LdapAliasDerefError = require('./test_errors/ldap_alias_deref_error');
const LdapInappropriateAuthError = require('./test_errors/ldap_inappropriate_auth_error');
const LdapCredentialsError = require('./test_errors/ldap_invalid_credentials_error');
const LdapAccessError = require('./test_errors/ldap_access_error');
const LdapBusyError = require('./test_errors/ldap_busy_error');
const LdapUnavailable = require('./test_errors/ldap_unavailable_error');
const LdapUnWillingError = require('./test_errors/ldap_unwilling_error');
const LdapLoopError = require('./test_errors/ldap_loop_error');
const LdapNamingError = require('./test_errors/ldap_naming_error');
const LdapObjectClassError = require('./test_errors/ldap_object_class_error');
const LdapNonLeafError = require('./test_errors/ldap_non_leaf_error');
const LdapRdnError = require('./test_errors/ldap_rdn_error');
const LdapAlreadyExists = require('./test_errors/ldap_already_exists_error');
const LdapClassModsError = require('./test_errors/ldap_object_class_mods_error');
const LdapDsasError = require('./test_errors/ldap_dsas_error');
const LdapOtherError = require('./test_errors/ldap_other_error');


const errors = {
  LdapInvalidDnError: LdapInvalidDnError,
  LdapSizeLimitError: LdapSizeLimitError,
  LdapTimeLimitError: LdapTimeLimitError,
  LdapProtocolError: LdapProtocolError,
  LdapInvalidSyntaxError: LdapInvalidSyntaxError,
  LdapOperationError: LdapOperationError,
  LdapCompareFalse: LdapCompareFalse,
  LdapCompareTrue: LdapCompareTrue,
  LdapAuthUnsupportedError: LdapAuthUnsupportedError,
  LdapStrongAuthError: LdapStrongAuthError,
  LdapReferralError: LdapReferralError,
  LdapAdminLimitError: LdapAdminLimitError,
  LdapCriticalExtensionError: LdapCriticalExtensionError,
  LdapConfidentialityError: LdapConfidentialityError,
  LdapSaslBindError: LdapSaslBindError,
  LdapNoSuchAttribute: LdapNoSuchAttribute,
  LdapUndefinedTypeError: LdapUndefinedTypeError,
  LdapMatchingError: LdapMatchingError,
  LdapConstraintError: LdapConstraintError,
  LdapTypeOrValueAlreadyExistsError: LdapTypeOrValueAlreadyExistsError,
  LdapNoSuchObjectError: LdapNoSuchObjectError,
  LdapAliasError: LdapAliasError,
  LdapLeafError: LdapLeafError,
  LdapAliasDerefError: LdapAliasDerefError,
  LdapInappropriateAuthError: LdapInappropriateAuthError,
  LdapCredentialsError: LdapCredentialsError,
  LdapAccessError: LdapAccessError,
  LdapBusyError: LdapBusyError,
  LdapUnavailable: LdapUnavailable,
  LdapUnWillingError: LdapUnWillingError,
  LdapLoopError: LdapLoopError,
  LdapNamingError: LdapNamingError,
  LdapObjectClassError: LdapObjectClassError,
  LdapNonLeafError: LdapNonLeafError,
  LdapRdnError: LdapRdnError,
  LdapAlreadyExists: LdapAlreadyExists,
  LdapClassModsError: LdapClassModsError,
  LdapDsasError: LdapDsasError,
  LdapOtherError: LdapOtherError,


};

function errorSelection(code) {

  const FoundErrorClassKey = Object.keys(errors)
    .find((key) => {
      const ClassCandidate = errors[key];
      return code === ClassCandidate.code;
    });

  const DesiredErrorClass = FoundErrorClassKey === undefined
    ? LdapOtherError
    : errors[FoundErrorClassKey];

  return DesiredErrorClass;
}

module.exports = errorSelection;
