'use strict';

/**
 * Module has 2 maps with keys corresponding to the error codes
 *  and values corresponding to the description or to the error message
 * Table used as reference : http://wiki.servicenow.com/index.php?title=LDAP_Error_Codes#gsc.tab=0
 * 
 */


// Optional, Don't bother reviewing :)

const code2Description = new Map();
const code2Error = new Map();

code2Description.set(
  1,
  `Indicates an internal error. The server is unable to respond with a more specific error and is also unable to properly respond to a request.
     It does not indicate that the client has sent an erroneous message.
      In NDS 8.3x through NDS 7.xx, this was the default error for NDS errors that did not map to an LDAP error code.
       To conform to the new LDAP drafts, NDS 8.5 uses 80 (0x50) for such errors.`);
code2Description.set(
  2,
  'Indicates that the server has received an invalid or malformed request from the client.');
code2Description.set(
  3,
  'Indicates that the operation\'s time limit specified by either the client or the server has been exceeded. On search operations, incomplete results are returned.');
code2Description.set(
  4,
  'Indicates that in a search operation, the size limit specified by the client or the server has been exceeded. Incomplete results are returned.');
code2Description.set(
  5,
  'Does not indicate an error condition. Indicates that the results of a compare operation are false.');
code2Description.set(
  6,
  'Does not indicate an error condition. Indicates that the results of a compare operation are true.');
code2Description.set(
  7,
  'Indicates that during a bind operation the client requested an authentication method not supported by the LDAP server.');
code2Description.set(
  8,
  `Indicates one of the following: In bind requests, the LDAP server accepts only strong authentication.In a client request,
  the client requested an operation such as delete that requires strong authentication.
   In an unsolicited notice of disconnection, the LDAP server discovers the security protecting the communication between
    the client and server has unexpectedly failed or been compromised.`);
code2Description.set(
  10,
  `Does not indicate an error condition. In LDAPv3, indicates that the server does not hold the target entry of the request,
  but that the servers in the referral field may.`);
code2Description.set(
  11,
  'Indicates that an LDAP server limit set by an administrative authority has been exceeded.');
code2Description.set(
  12,
  `Indicates that the LDAP server was unable to satisfy a request because one or more critical extensions were not available.
  Either the server does not support the control or the control is not appropriate for the operation type.`);
code2Description.set(
  13,
  'Indicates that the session is not protected by a protocol such as Transport Layer Security (TLS), which provides session confidentiality.');
code2Description.set(
  14,
  `Does not indicate an error condition, but indicates that the server is ready for the next step in the process.
   The client must send the server the same SASL mechanism to continue the process.`);
code2Description.set(
  16,
  'Indicates that the attribute specified in the modify or compare operation does not exist in the entry.');
code2Description.set(
  17,
  'Indicates that the attribute specified in the modify or add operation does not exist in the LDAP server\'s schema.');
code2Description.set(
  18,
  'Indicates that the matching rule specified in the search filter does not match a rule defined for the attribute\'s syntax.');
code2Description.set(
  19,
  `Indicates that the attribute value specified in a modify, add, or modify DN operation violates constraints placed on the attribute.
   The constraint can be one of size or content (string only, no binary).`);
code2Description.set(
  20,
  'Indicates that the attribute value specified in a modify or add operation already exists as a value for that attribute.');
code2Description.set(
  21,
  'Indicates that the attribute value specified in an add, compare, or modify operation is an unrecognized or invalid syntax for the attribute.');
code2Description.set(
  32,
  `Indicates the target object cannot be found. This code is not returned on following operations:
   Search operations that find the search base but cannot find any entries that match the search filter. Bind operations.`);
code2Description.set(
  33, 'Indicates that an error occurred when an alias was dereferenced.');
code2Description.set(34, `Indicates that the syntax of the DN is incorrect. 
  (If the DN syntax is correct, but the LDAP server's structure rules do not permit the operation, the server returns LDAP_UNWILLING_TO_PERFORM.`);
code2Description.set(
  35,
  `Indicates that the specified operation cannot be performed on a leaf entry.
   (This code is not currently in the LDAP specifications, but is reserved for this constant.`);
code2Description.set(
  36,
  'Indicates that during a search operation, either the client does not have access rights to read the aliased object\'s name or dereferencing is not allowed.');
code2Description.set(
  48,
  `Indicates that during a bind operation, the client is attempting to use an authentication method that the client cannot use correctly.
   For example: either of the following cause this error: The client returns simple credentials when strong credentials are required...OR
   ...The client returns a DN and a password for a simple bind when the entry does not have a password defined.`);
code2Description.set(
  49,
  `Indicates that during a bind operation one of the following occurred: The client passed either an incorrect DN or password,
   or the password is incorrect because it has expired, intruder detection has locked the account, or another similar reason. See the data code for more information.`);
code2Description.set(
  50,
  'Indicates that the caller does not have sufficient rights to perform the requested operation.');
code2Description.set(
  51,
  `Indicates that the LDAP server is too busy to process the client request at this time but if the client waits and resubmits the request,
   the server may be able to process it then.`);
code2Description.set(
  52,
  'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.');
code2Description.set(
  53,
  `Indicates that the LDAP server cannot process the request because of server-defined restrictions.
   This error is returned for the following reasons: The add entry request violates the server's structure rules...OR
   ...The modify attribute request specifies attributes that users cannot modify...OR...Password restrictions prevent the action...OR
   ...Connection restrictions prevent the action.`);
code2Description.set(
  54,
  'Indicates that the client discovered an alias or referral loop, and is thus unable to complete this request.');
code2Description.set(
  64,
  `Indicates that the add or modify DN operation violates the schema's structure rules. For example,
       The request places the entry subordinate to an alias. The request places the entry subordinate to a container 
       that is forbidden by the containment rules. The RDN for the entry uses a forbidden attribute type.`);
code2Description.set(
  65,
  `Indicates that the add, modify, or modify DN operation violates the object class rules for the entry. For example,
       the following types of request return this error:
       The add or modify operation tries to add an entry without a value for a required attribute. The add or modify operation
       tries to add an entry with a value for an attribute which the class definition does not contain. The modify operation tries
       to remove a required attribute without removing the auxiliary class that defines the attribute as required.`);
code2Description.set(
  66,
  `Indicates that the requested operation is permitted only on leaf entries. For example, the following types of requests return 
       this error: The client requests a delete operation on a parent entry. The client request a modify DN operation on a parent entry.`);
code2Description.set(
  67,
  'Indicates that the modify operation attempted to remove an attribute value that forms the entry\'s relative distinguished name.');
code2Description.set(
  68,
  `Indicates that the add operation attempted to add an entry that already exists, or that the modify operation attempted to rename
       an entry to the name of an entry that already exists.`);
code2Description.set(
  69,
  'Indicates that the modify operation attempted to modify the structure rules of an object class.');
code2Description.set(
  71,
  'Indicates that the modify DN operation moves the entry from one LDAP server to another and requires more than one LDAP server.');
code2Description.set(
  80,
  'Indicates an unknown error condition. This is the default value for NDS error codes which do not map to other LDAP error codes.');


code2Error.set(1, 'LDAP_OPERATIONS_ERROR');
code2Error.set(2, 'LDAP_PROTOCOL_ERROR');
code2Error.set(3, 'LDAP_TIMELIMIT_EXCEEDED');
code2Error.set(4, 'LDAP_SIZELIMIT_EXCEEDED');
code2Error.set(5, 'LDAP_COMPARE_FALSE');
code2Error.set(6, 'LDAP_COMPARE_TRUE');
code2Error.set(7, 'LDAP_AUTH_METHOD_NOT_SUPPORTED');
code2Error.set(8, 'LDAP_STRONG_AUTH_REQUIRED');
code2Error.set(10, 'LDAP_REFERRAL');
code2Error.set(11, 'LDAP_ADMINLIMIT_EXCEEDED');
code2Error.set(12, 'LDAP_UNAVAILABLE_CRITICAL_EXTENSION');
code2Error.set(13, 'LDAP_CONFIDENTIALITY_REQUIRED');
code2Error.set(14, 'LDAP_SASL_BIND_IN_PROGRESS');
code2Error.set(16, 'LDAP_NO_SUCH_ATTRIBUTE');
code2Error.set(17, 'LDAP_UNDEFINED_TYPE');
code2Error.set(18, 'LDAP_INAPPROPRIATE_MATCHING');
code2Error.set(19, 'LDAP_CONSTRAINT_VIOLATION');
code2Error.set(20, 'LDAP_TYPE_OR_VALUE_EXISTS');
code2Error.set(21, 'LDAP_INVALID_SYNTAX');
code2Error.set(32, 'LDAP_NO_SUCH_OBJECT');
code2Error.set(33, 'LDAP_ALIAS_PROBLEM');
code2Error.set(34, 'LDAP_INVALID_DN_SYNTAX');
code2Error.set(35, 'LDAP_IS_LEAF');
code2Error.set(36, 'LDAP_ALIAS_DEREF_PROBLEM');
code2Error.set(48, 'LDAP_INAPPROPRIATE_AUTH');
code2Error.set(49, 'LDAP_INVALID_CREDENTIALS');
code2Error.set(50, 'LDAP_INSUFFICIENT_ACCESS');
code2Error.set(51, 'LDAP_BUSY');
code2Error.set(52, 'LDAP_UNAVAILABLE');
code2Error.set(53, 'LDAP_UNWILLING_TO_PERFORM');
code2Error.set(54, 'LDAP_LOOP_DETECT');
code2Error.set(64, 'LDAP_NAMING_VIOLATION');
code2Error.set(65, 'LDAP_OBJECT_CLASS_VIOLATION');
code2Error.set(66, 'LDAP_NOT_ALLOWED_ON_NONLEAF');
code2Error.set(67, 'LDAP_NOT_ALLOWED_ON_RDN');
code2Error.set(68, 'LDAP_ALREADY_EXISTS');
code2Error.set(69, 'LDAP_NO_OBJECT_CLASS_MODS');
code2Error.set(70, 'LDAP_RESULTS_TOO_LARGE');
code2Error.set(71, 'LDAP_AFFECTS_MULTIPLE_DSAS');
code2Error.set(80, 'LDAP_OTHER');


class ErrorMaps {


  /**
 * 
 * @param {int} errorId Ldap error number(1-80)
 * @return {String} errorName, name of the error; e.g.: LDAP_BUSY
 */
  static getError(errorId) {
    const errorName = code2Error.get(errorId);
    return errorName;

  }
  /**
   * 
   * @param {int} errorId Ldap error number(1-80) 
   * @return {String} errorDescription, Message that explains the error.
   */
  static getDescription(errorId) {
    const errorDescription = code2Description.get(errorId);
    return errorDescription;
  }


}

module.exports = ErrorMaps;
