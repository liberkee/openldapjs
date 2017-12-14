import LdapInvalidDnError = require('./ldap_errors/ldap_invalid_dn_error');
import LdapSizeLimitError = require('./ldap_errors/ldap_size_limit_error');
import LdapTimeLimitError = require('./ldap_errors/ldap_time_limit_error');
import LdapProtocolError = require('./ldap_errors/ldap_protocol_error');
import LdapInvalidSyntaxError = require('./ldap_errors/ldap_invalid_syntax_error');
import LdapOperationError = require('./ldap_errors/ldap_operation_error');
import LdapAuthUnsupportedError = require('./ldap_errors/ldap_auth_method_unsupported');
import LdapStrongAuthError = require('./ldap_errors/ldap_strong_auth_error');
import LdapReferralError = require('./ldap_errors/ldap_referral_error');
import LdapAdminLimitError = require('./ldap_errors/ldap_admin_limit_error');
import LdapCriticalExtensionError = require('./ldap_errors/ldap_unavailable_critical_ext');
import LdapConfidentialityError = require('./ldap_errors/ldap_confidentiality_error');
import LdapSaslBindError = require('./ldap_errors/ldap_sasl_bind_error');
import LdapNoSuchAttribute = require('./ldap_errors/ldap_no_such_attribute_error');
import LdapUndefinedTypeError = require('./ldap_errors/ldap_undefined_type_error');
import LdapMatchingError = require('./ldap_errors/ldap_inappropriate_matching_error');
import LdapConstraintError = require('./ldap_errors/ldap_constraint_error');
import LdapTypeOrValueAlreadyExistsError = require('./ldap_errors/ldap_attribute_exists_error');
import LdapNoSuchObjectError = require('./ldap_errors/ldap_object_not_found_error');
import LdapAliasError = require('./ldap_errors/ldap_alias_error');
import LdapLeafError = require('./ldap_errors/ldap_leaf_error');
import LdapAliasDerefError = require('./ldap_errors/ldap_alias_deref_error');
import LdapInappropriateAuthError = require('./ldap_errors/ldap_inappropriate_auth_error');
import LdapCredentialsError = require('./ldap_errors/ldap_invalid_credentials_error');
import LdapAccessError = require('./ldap_errors/ldap_access_error');
import LdapBusyError = require('./ldap_errors/ldap_busy_error');
import LdapUnavailable = require('./ldap_errors/ldap_unavailable_error');
import LdapUnWillingError = require('./ldap_errors/ldap_unwilling_error');
import LdapLoopError = require('./ldap_errors/ldap_loop_error');
import LdapNamingError = require('./ldap_errors/ldap_naming_error');
import LdapObjectClassError = require('./ldap_errors/ldap_object_class_error');
import LdapNonLeafError = require('./ldap_errors/ldap_non_leaf_error');
import LdapRdnError = require('./ldap_errors/ldap_rdn_error');
import LdapAlreadyExists = require('./ldap_errors/ldap_already_exists_error');
import LdapClassModsError = require('./ldap_errors/ldap_object_class_mods_error');
import LdapDsasError = require('./ldap_errors/ldap_dsas_error');
import LdapOtherError = require('./ldap_errors/ldap_other_error');


export interface IErrorList {
  LdapInvalidDnError: LdapInvalidDnError;
  LdapSizeLimitError: LdapSizeLimitError;
  LdapTimeLimitError: LdapTimeLimitError;
  LdapProtocolError: LdapProtocolError;
  LdapInvalidSyntaxError: LdapInvalidSyntaxError;
  LdapOperationError: LdapOperationError;
  LdapAuthUnsupportedError: LdapAuthUnsupportedError;
  LdapStrongAuthError: LdapStrongAuthError;
  LdapReferralError: LdapReferralError;
  LdapAdminLimitError: LdapAdminLimitError;
  LdapCriticalExtensionError: LdapCriticalExtensionError;
  LdapConfidentialityError: LdapConfidentialityError;
  LdapSaslBindError: LdapSaslBindError;
  LdapNoSuchAttribute: LdapNoSuchAttribute;
  LdapUndefinedTypeError: LdapUndefinedTypeError;
  LdapMatchingError: LdapMatchingError;
  LdapConstraintError: LdapConstraintError;
  LdapTypeOrValueAlreadyExistsError: LdapTypeOrValueAlreadyExistsError;
  LdapNoSuchObjectError: LdapNoSuchObjectError;
  LdapAliasError: LdapAliasError;
  LdapLeafError: LdapLeafError;
  LdapAliasDerefError: LdapAliasDerefError;
  LdapInappropriateAuthError: LdapInappropriateAuthError;
  LdapCredentialsError: LdapCredentialsError;
  LdapAccessError: LdapAccessError;
  LdapBusyError: LdapBusyError;
  LdapUnavailable: LdapUnavailable;
  LdapUnWillingError: LdapUnWillingError;
  LdapLoopError: LdapLoopError;
  LdapNamingError: LdapNamingError;
  LdapObjectClassError: LdapObjectClassError;
  LdapNonLeafError: LdapNonLeafError;
  LdapRdnError: LdapRdnError;
  LdapAlreadyExists: LdapAlreadyExists;
  LdapClassModsError: LdapClassModsError;
  LdapDsasError: LdapDsasError;
  LdapOtherError: LdapOtherError;
}
/**
 * Function that returns the error class corresponding to the LDAP error code.
 * @param {Number} code Ldap error code ranging from 1 to 80 or negative for API errors.
 * @return {Error} DesiredErrorClass Custom error class corresponding to the ldap error code.
 */
export declare function errorFunction(code:number):any;