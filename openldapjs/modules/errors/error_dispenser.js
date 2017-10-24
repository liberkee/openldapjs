'use strict';

const LdapError = require('./ldap_errors/ldap_error');
const LdapInvalidDnError = require('./ldap_errors/ldap_invalid_dn_error');
const LdapSizeLimitError = require('./ldap_errors/ldap_size_limit_error');
const LdapTimeLimitError = require('./ldap_errors/ldap_time_limit_error');
const LdapProtocolError = require('./ldap_errors/ldap_protocol_error');
const LdapInvalidSyntaxError = require('./ldap_errors/ldap_invalid_syntax_error');
const LdapOperationError = require('./ldap_errors/ldap_operation_error');
const LdapAuthUnsupportedError = require('./ldap_errors/ldap_auth_method_unsupported');
const LdapStrongAuthError = require('./ldap_errors/ldap_strong_auth_error');
const LdapReferralError = require('./ldap_errors/ldap_referral_error');
const LdapAdminLimitError = require('./ldap_errors/ldap_admin_limit_error');
const LdapCriticalExtensionError = require('./ldap_errors/ldap_unavailable_critical_ext');
const LdapConfidentialityError = require('./ldap_errors/ldap_confidentiality_error');
const LdapSaslBindError = require('./ldap_errors/ldap_sasl_bind_error');
const LdapNoSuchAttribute = require('./ldap_errors/ldap_no_such_attribute_error');
const LdapUndefinedTypeError = require('./ldap_errors/ldap_undefined_type_error');
const LdapMatchingError = require('./ldap_errors/ldap_inappropriate_matching_error');
const LdapConstraintError = require('./ldap_errors/ldap_constraint_error');
const LdapTypeOrValueAlreadyExistsError = require('./ldap_errors/ldap_attribute_exists_error');
const LdapNoSuchObjectError = require('./ldap_errors/ldap_object_not_found_error');
const LdapAliasError = require('./ldap_errors/ldap_alias_error');
const LdapLeafError = require('./ldap_errors/ldap_leaf_error');
const LdapAliasDerefError = require('./ldap_errors/ldap_alias_deref_error');
const LdapInappropriateAuthError = require('./ldap_errors/ldap_inappropriate_auth_error');
const LdapCredentialsError = require('./ldap_errors/ldap_invalid_credentials_error');
const LdapAccessError = require('./ldap_errors/ldap_access_error');
const LdapBusyError = require('./ldap_errors/ldap_busy_error');
const LdapUnavailable = require('./ldap_errors/ldap_unavailable_error');
const LdapUnWillingError = require('./ldap_errors/ldap_unwilling_error');
const LdapLoopError = require('./ldap_errors/ldap_loop_error');
const LdapNamingError = require('./ldap_errors/ldap_naming_error');
const LdapObjectClassError = require('./ldap_errors/ldap_object_class_error');
const LdapNonLeafError = require('./ldap_errors/ldap_non_leaf_error');
const LdapRdnError = require('./ldap_errors/ldap_rdn_error');
const LdapAlreadyExists = require('./ldap_errors/ldap_already_exists_error');
const LdapClassModsError = require('./ldap_errors/ldap_object_class_mods_error');
const LdapDsasError = require('./ldap_errors/ldap_dsas_error');
const LdapOtherError = require('./ldap_errors/ldap_other_error');


const errors = {
  LdapInvalidDnError: LdapInvalidDnError,
  LdapSizeLimitError: LdapSizeLimitError,
  LdapTimeLimitError: LdapTimeLimitError,
  LdapProtocolError: LdapProtocolError,
  LdapInvalidSyntaxError: LdapInvalidSyntaxError,
  LdapOperationError: LdapOperationError,
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
/**
 * Function that returns the error class corresponding to the LDAP error code.
 * @param {Number} code Ldap error code ranging from 1 to 80.
 * @return {Error} DesiredErrorClass Custom error class corresponding to the ldap error code.
 */
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
