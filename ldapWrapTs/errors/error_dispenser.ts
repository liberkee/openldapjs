import * as LdapInvalidDnError from './ldap_errors/ldap_invalid_dn_error';
import * as LdapSizeLimitError from './ldap_errors/ldap_size_limit_error';
import * as LdapTimeLimitError from './ldap_errors/ldap_time_limit_error';
import * as LdapProtocolError from './ldap_errors/ldap_protocol_error';
import * as LdapInvalidSyntaxError from './ldap_errors/ldap_invalid_syntax_error';
import * as LdapOperationError from './ldap_errors/ldap_operation_error';
import * as LdapAuthUnsupportedError from './ldap_errors/ldap_auth_method_unsupported';
import * as LdapStrongAuthError from './ldap_errors/ldap_strong_auth_error';
import * as LdapReferralError from './ldap_errors/ldap_referral_error';
import * as LdapAdminLimitError from './ldap_errors/ldap_admin_limit_error';
import * as LdapCriticalExtensionError from './ldap_errors/ldap_unavailable_critical_ext';
import * as LdapConfidentialityError from './ldap_errors/ldap_confidentiality_error';
import * as LdapSaslBindError from './ldap_errors/ldap_sasl_bind_error';
import * as LdapNoSuchAttribute from './ldap_errors/ldap_no_such_attribute_error';
import * as LdapUndefinedTypeError from './ldap_errors/ldap_undefined_type_error';
import * as LdapMatchingError from './ldap_errors/ldap_inappropriate_matching_error';
import * as LdapConstraintError from './ldap_errors/ldap_constraint_error';
import * as LdapTypeOrValueAlreadyExistsError from './ldap_errors/ldap_attribute_exists_error';
import * as LdapNoSuchObjectError from './ldap_errors/ldap_object_not_found_error';
import * as LdapAliasError from './ldap_errors/ldap_alias_error';
import * as LdapLeafError from './ldap_errors/ldap_leaf_error';
import * as LdapAliasDerefError from './ldap_errors/ldap_alias_deref_error';
import * as LdapInappropriateAuthError from './ldap_errors/ldap_inappropriate_auth_error';
import * as LdapCredentialsError from './ldap_errors/ldap_invalid_credentials_error';
import * as LdapAccessError from './ldap_errors/ldap_access_error';
import * as LdapBusyError from './ldap_errors/ldap_busy_error';
import * as LdapUnavailable from './ldap_errors/ldap_unavailable_error';
import * as LdapUnWillingError from './ldap_errors/ldap_unwilling_error';
import * as LdapLoopError from './ldap_errors/ldap_loop_error';
import * as LdapNamingError from './ldap_errors/ldap_naming_error';
import * as LdapObjectClassError from './ldap_errors/ldap_object_class_error';
import * as LdapNonLeafError from './ldap_errors/ldap_non_leaf_error';
import * as LdapRdnError from './ldap_errors/ldap_rdn_error';
import * as LdapAlreadyExists from './ldap_errors/ldap_already_exists_error';
import * as LdapClassModsError from './ldap_errors/ldap_object_class_mods_error';
import * as LdapDsasError from './ldap_errors/ldap_dsas_error';
import * as LdapOtherError from './ldap_errors/ldap_other_error';

export const errors:any = {
  LdapInvalidDnError: (LdapInvalidDnError.default),
  LdapSizeLimitError: (LdapSizeLimitError.default),
  LdapTimeLimitError: (LdapTimeLimitError.default),
  LdapProtocolError: (LdapProtocolError.default),
  LdapInvalidSyntaxError: (LdapInvalidSyntaxError.default),
  LdapOperationError: (LdapOperationError.default),
  LdapAuthUnsupportedError: (LdapAuthUnsupportedError.default),
  LdapStrongAuthError: (LdapStrongAuthError.default),
  LdapReferralError: (LdapReferralError.default),
  LdapAdminLimitError: (LdapAdminLimitError.default),
  LdapCriticalExtensionError: (LdapCriticalExtensionError.default),
  LdapConfidentialityError: (LdapConfidentialityError.default),
  LdapSaslBindError: (LdapSaslBindError.default),
  LdapNoSuchAttribute: (LdapNoSuchAttribute.default),
  LdapUndefinedTypeError: (LdapUndefinedTypeError.default),
  LdapMatchingError: (LdapMatchingError.default),
  LdapConstraintError: (LdapConstraintError.default),
  LdapTypeOrValueAlreadyExistsError: (LdapTypeOrValueAlreadyExistsError.default),
  LdapNoSuchObjectError: (LdapNoSuchObjectError.default),
  LdapAliasError: (LdapAliasError.default),
  LdapLeafError: (LdapLeafError.default),
  LdapAliasDerefError: (LdapAliasDerefError.default),
  LdapInappropriateAuthError: (LdapInappropriateAuthError.default),
  LdapCredentialsError: (LdapCredentialsError.default),
  LdapAccessError: (LdapAccessError.default),
  LdapBusyError: (LdapBusyError.default),
  LdapUnavailable: (LdapUnavailable.default),
  LdapUnWillingError: (LdapUnWillingError.default),
  LdapLoopError: (LdapLoopError.default),
  LdapNamingError: (LdapNamingError.default),
  LdapObjectClassError: (LdapObjectClassError.default),
  LdapNonLeafError: (LdapNonLeafError.default),
  LdapRdnError: (LdapRdnError.default),
  LdapAlreadyExists: (LdapAlreadyExists.default),
  LdapClassModsError: (LdapClassModsError.default),
  LdapDsasError: (LdapDsasError.default),
  LdapOtherError: (LdapOtherError.default),
};
/**
 * Function that returns the error class corresponding to the LDAP error code.
 * @param {Number} code Ldap error code ranging from 1 to 80 or negative for API errors.
 * @return {Error} DesiredErrorClass Custom error class corresponding to the ldap error code.
 */
export function errorSelection(code:number):Error {

  const FoundErrorClassKey:string | undefined = Object.keys(errors)
    .find(key => {
      const ClassCandidate = errors[key];
      return code === ClassCandidate.code;
    });

  const DesiredErrorClass:Error = FoundErrorClassKey === undefined
    ? LdapOtherError
    : errors[FoundErrorClassKey];

  return DesiredErrorClass;
}
