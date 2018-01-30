import LdapInvalidDnError from './ldap_errors/ldap_invalid_dn_error';
import LdapSizeLimitError from './ldap_errors/ldap_size_limit_error';
import LdapTimeLimitError from './ldap_errors/ldap_time_limit_error';
import LdapProtocolError from './ldap_errors/ldap_protocol_error';
import LdapInvalidSyntaxError from './ldap_errors/ldap_invalid_syntax_error';
import LdapOperationError from './ldap_errors/ldap_operation_error';
import LdapAuthUnsupportedError from './ldap_errors/ldap_auth_method_unsupported';
import LdapStrongAuthError from './ldap_errors/ldap_strong_auth_error';
import LdapReferralError from './ldap_errors/ldap_referral_error';
import LdapAdminLimitError from './ldap_errors/ldap_admin_limit_error';
import LdapCriticalExtensionError from './ldap_errors/ldap_unavailable_critical_ext';
import LdapConfidentialityError from './ldap_errors/ldap_confidentiality_error';
import LdapSaslBindError from './ldap_errors/ldap_sasl_bind_error';
import LdapNoSuchAttribute from './ldap_errors/ldap_no_such_attribute_error';
import LdapUndefinedTypeError from './ldap_errors/ldap_undefined_type_error';
import LdapMatchingError from './ldap_errors/ldap_inappropriate_matching_error';
import LdapConstraintError from './ldap_errors/ldap_constraint_error';
import LdapTypeOrValueAlreadyExistsError from './ldap_errors/ldap_attribute_exists_error';
import LdapNoSuchObjectError from './ldap_errors/ldap_object_not_found_error';
import LdapAliasError from './ldap_errors/ldap_alias_error';
import LdapLeafError from './ldap_errors/ldap_leaf_error';
import LdapAliasDerefError from './ldap_errors/ldap_alias_deref_error';
import LdapInappropriateAuthError from './ldap_errors/ldap_inappropriate_auth_error';
import LdapCredentialsError from './ldap_errors/ldap_invalid_credentials_error';
import LdapAccessError from './ldap_errors/ldap_access_error';
import LdapBusyError from './ldap_errors/ldap_busy_error';
import LdapUnavailable from './ldap_errors/ldap_unavailable_error';
import LdapUnWillingError from './ldap_errors/ldap_unwilling_error';
import LdapLoopError from './ldap_errors/ldap_loop_error';
import LdapNamingError from './ldap_errors/ldap_naming_error';
import LdapObjectClassError from './ldap_errors/ldap_object_class_error';
import LdapNonLeafError from './ldap_errors/ldap_non_leaf_error';
import LdapRdnError from './ldap_errors/ldap_rdn_error';
import LdapAlreadyExists from './ldap_errors/ldap_already_exists_error';
import LdapClassModsError from './ldap_errors/ldap_object_class_mods_error';
import LdapDsasError from './ldap_errors/ldap_dsas_error';
import LdapOtherError from './ldap_errors/ldap_other_error';

export const errors: any = {
  LdapInvalidDnError: (LdapInvalidDnError),
  LdapSizeLimitError: (LdapSizeLimitError),
  LdapTimeLimitError: (LdapTimeLimitError),
  LdapProtocolError: (LdapProtocolError),
  LdapInvalidSyntaxError: (LdapInvalidSyntaxError),
  LdapOperationError: (LdapOperationError),
  LdapAuthUnsupportedError: (LdapAuthUnsupportedError),
  LdapStrongAuthError: (LdapStrongAuthError),
  LdapReferralError: (LdapReferralError),
  LdapAdminLimitError: (LdapAdminLimitError),
  LdapCriticalExtensionError: (LdapCriticalExtensionError),
  LdapConfidentialityError: (LdapConfidentialityError),
  LdapSaslBindError: (LdapSaslBindError),
  LdapNoSuchAttribute: (LdapNoSuchAttribute),
  LdapUndefinedTypeError: (LdapUndefinedTypeError),
  LdapMatchingError: (LdapMatchingError),
  LdapConstraintError: (LdapConstraintError),
  LdapTypeOrValueAlreadyExistsError: (LdapTypeOrValueAlreadyExistsError),
  LdapNoSuchObjectError: (LdapNoSuchObjectError),
  LdapAliasError: (LdapAliasError),
  LdapLeafError: (LdapLeafError),
  LdapAliasDerefError: (LdapAliasDerefError),
  LdapInappropriateAuthError: (LdapInappropriateAuthError),
  LdapCredentialsError: (LdapCredentialsError),
  LdapAccessError: (LdapAccessError),
  LdapBusyError: (LdapBusyError),
  LdapUnavailable: (LdapUnavailable),
  LdapUnWillingError: (LdapUnWillingError),
  LdapLoopError: (LdapLoopError),
  LdapNamingError: (LdapNamingError),
  LdapObjectClassError: (LdapObjectClassError),
  LdapNonLeafError: (LdapNonLeafError),
  LdapRdnError: (LdapRdnError),
  LdapAlreadyExists: (LdapAlreadyExists),
  LdapClassModsError: (LdapClassModsError),
  LdapDsasError: (LdapDsasError),
  LdapOtherError: (LdapOtherError),
};
/**
 * Function that returns the error class corresponding to the LDAP error code.
 * @param {Number} code Ldap error code ranging from 1 to 80 or negative for API errors.
 * @return {Error} DesiredErrorClass Custom error class corresponding to the ldap error code.
 */
export function errorSelection(code: number): Error {

  const foundErrorClassKey: string | undefined = Object.keys(errors)
    .find(key => {
      const classCandidate = errors[key];
      return code === classCandidate.code;
    });

  const desiredErrorClass: Error = foundErrorClassKey === undefined
    ? LdapOtherError
    : errors[foundErrorClassKey];

  return desiredErrorClass;
}
