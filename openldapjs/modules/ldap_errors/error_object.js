'use strict';


const Errors = {
  1: {
    Name: 'LDAP_OPERATIONS_ERROR',
    Description: 'Indicates an internal error. The server is unable to respond with a more specific error and is also unable to properly respond to a request.' +
                 'It does not indicate that the client has sent an erroneous message.' +
                 'In NDS 8.3x through NDS 7.xx, this was the default error for NDS errors that did not map to an LDAP error code.' +
                 'To conform to the new LDAP drafts, NDS 8.5 uses 80 (0x50) for such errors.',
  },

  2: {
    Name: 'LDAP_PROTOCOL_ERROR',
    Description: 'Indicates that the server has received an invalid or malformed request from the client.',
  },
  3: {
    Name: 'LDAP_TIMELIMIT_EXCEEDED',
    Description: 'Indicates that the operation\'s time limit specified by either the client or the server' +
                 'has been exceeded. On search operations, incomplete results are returned.',
  },
  4: {
    Name: 'LDAP_SIZELIMIT_EXCEEDED',
    Description: 'Indicates that in a search operation, the size limit specified by the client or the server' +
                 'has been exceeded. Incomplete results are returned.',
  },
  5: {
    Name: 'LDAP_COMPARE_FALSE',
    Description: 'Does not indicate an error condition.' +
                 'Indicates that the results of a compare operation are false.',
  },
  6: {
    Name: 'LDAP_COMPARE_TRUE',
    Description: 'Does not indicate an error condition.' +
                 'Indicates that the results of a compare operation are true.',
  },
  7: {
    Name: 'LDAP_AUTH_METHOD_NOT_SUPPORTED',
    Description: 'Indicates that during a bind operation the client requested' +
                 'an authentication method not supported by the LDAP server.',
  },
  8: {
    Name: 'LDAP_STRONG_AUTH_REQUIRED',
    Description: 'Indicates one of the following: In bind requests, the LDAP server accepts only strong authentication.' +
                 'In a client request, the client requested an operation such as delete that requires strong authentication.' +
                 'In an unsolicited notice of disconnection, the LDAP server discovers the security protecting the communication' +
                 'between the client and server has unexpectedly failed or been compromised.',
  },
  10: {
    Name: 'LDAP_REFERRAL',
    Description: 'Does not indicate an error condition. In LDAPv3, indicates that the server' +
                 'does not hold the target entry of the request, but that the servers in the referral field may.',
  },
  11: {
    Name: 'LDAP_ADMINLIMIT_EXCEEDED',
    Description: 'Indicates that an LDAP server limit set by an administrative authority has been exceeded.',
  },
  12: {
    Name: 'LDAP_UNAVAILABLE_CRITICAL_EXTENSION',
    Description: 'Indicates that the LDAP server was unable to satisfy a request because one or more critical' +
                 'extensions were not available. Either the server does not support the control or the control is not appropriate for the operation type.',
  },
  13: {
    Name: 'LDAP_CONFIDENTIALITY_REQUIRED',
    Description: 'Indicates that the session is not protected by a protocol such as Transport Layer Security (TLS), which provides session confidentiality.',
  },
  14: {
    Name: 'LDAP_SASL_BIND_IN_PROGRESS',
    Description: 'Does not indicate an error condition, but indicates that the server is ready for the next step in the process.' +
                 'The client must send the server the same SASL mechanism to continue the process.',
  },
  16: {
    Name: 'LDAP_NO_SUCH_ATTRIBUTE',
    Description: 'Indicates that the attribute specified in the modify or compare operation does not exist in the entry.',
  },
  17: {
    Name: 'LDAP_UNDEFINED_TYPE',
    Description: 'Indicates that the attribute specified in the modify or add operation does not exist in the LDAP server\'s schema.',
  },
  18: {
    Name: 'LDAP_INAPPROPRIATE_MATCHING',
    Description: 'Indicates that the matching rule specified in the search filter does not match a rule defined for the attribute\'s syntax.',

  },
  19: {
    Name: 'LDAP_CONSTRAINT_VIOLATION',
    Description: 'Indicates that the attribute value specified in a modify, add, or modify DN operation violates constraints placed on the attribute. The constraint can be one of size or content (string only, no binary).',
  },
  20: {
    Name: 'LDAP_TYPE_OR_VALUE_EXISTS',
    Description: 'Indicates that the attribute value specified in a modify or add operation already exists as a value for that attribute.',
  },
  21: {
    Name: 'LDAP_INVALID_SYNTAX',
    Description: 'Indicates that the attribute value specified in an add, compare, or modify operation is an unrecognized or invalid syntax for the attribute.',
  },
  32: {
    Name: 'LDAP_NO_SUCH_OBJECT',
    Description: 'Indicates the target object cannot be found. This code is not returned on following operations: Search operations that find the search base but cannot find any entries that match the search filter. Bind operations.',
  },
  33: {
    Name: 'LDAP_ALIAS_PROBLEM',
    Description: 'Indicates that an error occurred when an alias was dereferenced.',

  },
  34: {
    Name: 'LDAP_INVALID_DN_SYNTAX',
    Description: 'Indicates that the syntax of the DN is incorrect. (If the DN syntax is correct, but the LDAP server\'s structure rules do not permit the operation, the server returns LDAP_UNWILLING_TO_PERFORM.)',
  },

  35: {
    Name: 'LDAP_IS_LEAF',
    Description: 'Indicates that the specified operation cannot be performed on a leaf entry. (This code is not currently in the LDAP specifications, but is reserved for this constant.)',
  },
  36: {
    Name: 'LDAP_ALIAS_DEREF_PROBLEM',
    Description: 'Indicates that during a search operation, either the client does not have access rights to read the aliased object\'s name or dereferencing is not allowed.',
  },

  48: {
    Name: 'LDAP_INAPPROPRIATE_AUTH',
    Description: 'Indicates that during a bind operation, the client is attempting to use an authentication method that the client cannot use correctly.' +
                 'For example, either of the following cause this error: The client returns simple credentials when strong credentials are required' +
                 '...OR...The client returns a DN and a password for a simple bind when the entry does not have a password defined.',
  },

  49: {
    Name: 'LDAP_INVALID_CREDENTIALS',
    Description: 'Indicates that during a bind operation one of the following occurred: The client passed either an incorrect DN or password,' +
                 'or the password is incorrect because it has expired, intruder detection has locked the account, or another similar reason. See the data code for more information.',
  },

  50: {
    Name: 'LDAP_INSUFFICIENT_ACCESS',
    Description: 'Indicates that the caller does not have sufficient rights to perform the requested operation.',
  },
  51: {
    Name: 'LDAP_BUSY',
    Description: 'Indicates that the LDAP server is too busy to process the client request at this time but if the client waits and resubmits the request, the server may be able to process it then.',
  },
  52: {
    Name: 'LDAP_UNAVAILABLE',
    Description: 'Indicates that the LDAP server cannot process the client\'s bind request, usually because it is shutting down.',
  },
  53: {
    Name: 'LDAP_UNWILLING_TO_PERFORM',
    Description: 'Indicates that the LDAP server cannot process the request because of server-defined restrictions. This error is returned for the following reasons: The add entry request violates the server\'s structure rules...OR' +
                 '...The modify attribute request specifies attributes that users cannot modify...OR...Password restrictions prevent the action...OR...Connection restrictions prevent the action.',
  },
  54: {
    Name: 'LDAP_LOOP_DETECT',
    Description: 'Indicates that the client discovered an alias or referral loop, and is thus unable to complete this request.',
  },

  64: {
    Name: 'LDAP_NAMING_VIOLATION',
    Description: 'Indicates that the add or modify DN operation violates the schema\'s structure rules.' +
                 'For example,the request places the entry subordinate to an alias.' +
                 'The request places the entry subordinate to a container that is forbidden by the containment rules. The RDN for the entry uses a forbidden attribute type.',
  },
  65: {
    Name: 'LDAP_OBJECT_CLASS_VIOLATION',
    Description: 'Indicates that the add, modify, or modify DN operation violates the object class rules for the entry.' +
                 'For example, the following types of request return this error: The add or modify operation tries to add an entry without a value for a required attribute.' +
                 'The add or modify operation tries to add an entry with a value for an attribute which the class definition does not contain.' +
                 'The modify operation tries to remove a required attribute without removing the auxiliary class that defines the attribute as required.',
  },
  66: {
    Name: 'LDAP_NOT_ALLOWED_ON_NONLEAF',
    Description: 'Indicates that the requested operation is permitted only on leaf entries.' +
                 'For example, the following types of requests return this error:The client requests a delete operation on a parent entry.' +
                 'The client request a modify DN operation on a parent entry.',
  },
  67: {
    Name: 'LDAP_NOT_ALLOWED_ON_RDN',
    Description: 'Indicates that the modify operation attempted to remove an attribute value that forms the entry\'s relative distinguished name.',
  },
  68: {
    Name: 'LDAP_ALREADY_EXISTS',
    Description: 'Indicates that the add operation attempted to add an entry that already exists, or that the modify operation attempted to rename an entry to the name of an entry that already exists.',
  },
  69: {
    Name: 'LDAP_NO_OBJECT_CLASS_MODS',
    Description: 'Indicates that the modify operation attempted to modify the structure rules of an object class.',
  },

  71: {
    Name: 'LDAP_AFFECTS_MULTIPLE_DSAS',
    Description: 'Indicates that the modify DN operation moves the entry from one LDAP server to another and requires more than one LDAP server.',
  },
  80: {

    Name: 'LDAP_OTHER',
    Description: 'Indicates an unknown error condition. This is the default value for NDS error codes which do not map to other LDAP error codes.',

  },


};

module.exports = Errors;

