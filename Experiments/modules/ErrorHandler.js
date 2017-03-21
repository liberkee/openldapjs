'use strict';

const LdapError = class LdapError extends Error {

  constructor() {
    super();
    this._errorClass = 'LdapErrors';

  }

};

const AuthorizationError = class AuthorizationError extends LdapError {

  constructor(id) {
    super();
    const idToErrorDictionary = {
      7: 'Authentication Method Not Supported',
      8: 'Stronger Authentication Required',
      14: 'SASL Bind in Progress',
      48: 'Inappropriate Authentication',
      50: 'Insufficient Access Rights',
      123: 'Authorization Denied',
    };

    const idToErrorTextDictionary = {
      7: 'This indicates that a bind operation failed because the server does not support the requested authentication type',
      8: 'This indicates that the server requires that the client be authenticated with a stronger mechanism than has previously been performed in order to process the request. This result code may be used in a notice of disconnection unsolicited notification if the server believes that the security of the connection has been compromised.',
      14: 'This indicates that the server requires more information from the client in order to complete the SASL bind operation. In such responses, the "server SASL credentials" element of the result message will often include information the client needs for subsequent phases of bind processing.',
      48: 'This indicates that the client attempted to bind as a user that does not exist, attempted to bind as a user that is not allowed to bind (e.g., because it has expired, because it has been locked because of too many failed authentication attempts, etc.), or attempted to bind with credentials that were not correct for the target user.',
      50: 'This indicates that the client does not have permission to perform the requested operation.',
      123: 'This indicates that the requested operation could not be processed because the request included a proxied authorization request control (or some similar control intended to specify an alternate authorization identity for the operation), but the client was not allowed to request the use of that alternate authorization identity.',
    };

    this._error = idToErrorDictionary[id];
    this._errorText = idToErrorTextDictionary[id];
  }

};

const ConnectionHandlingError = class ConnectionHandlingError extends LdapError {

  constructor(id) {
    super();
    const idToErrorDictionary = {
      10: 'Referral',
      13: 'Confidentiality Required',
      51: 'Busy',
      52: 'Unavailable',
      53: 'Unwilling to Perform',
    };

    const idToErrorTextDictionary = {
      10: 'This indicates that the server could not process the requested operation, but that it may succeed if attempted in another location, as specified by the referral URIs included in the response.',
      13: 'This indicates that the requested operation is only allowed over a secure connection.',
      51: 'This indicates that the server is currently too busy to process the requested operation.',
      52: 'This indicates that the server is currently unavailable (e.g., because it is being shut down or is in a maintenance state).',
      53: 'This indicates that the server is unwilling to process the requested operation for some reason.',
    };

    this._error = idToErrorDictionary[id];
    this._errorText = idToErrorTextDictionary[id];
  }

};


const ObjectHandlingError = class ObjectHandlingError extends LdapError {

  constructor(id) {
    super();
    const idToErrorDictionary = {
      32: 'No Such Object',
    };

    const idToErrorTextDictionary = {
      32: 'This indicates that the client request targeted an entry that does not exist. Note that some servers use this result for a bind request that targets a nonexistent user, even though "invalid credentials" is a more appropriate result for that case.',
    };

    this._error = idToErrorDictionary[id];
    this._errorText = idToErrorTextDictionary[id];
  }

};

const AttributeHandlingError = class AttributeHandlingError extends LdapError {

  constructor(id) {
    super();
    const idToErrorDictionary = {
      16: 'No Such Attribute',
      17: 'Undefined Attribute Type',
      18: 'Inappropriate Matching',
      21: 'Invalid Attribute Syntax',
    };

    const idToErrorTextDictionary = {
      16: 'This indicates that the client attempted to interact with an attribute that does not exist in the target entry (e.g., to remove an attribute or value that does not exist).',
      17: 'This indicates that the client request included an attribute type that is not defined in the server schema.',
      18: 'This indicates that the client request attempted to perform an unsupported type of matching against an attribute. For example, this may be used if the attribute type does not have an appropriate matching rule for the type of matching requested for that attribute.',
      21: 'This indicates that the client request would have resulted in an attribute value that did not conform to the syntax for that attribute type.',
    };

    this._error = idToErrorDictionary[id];
    this._errorText = idToErrorTextDictionary[id];
  }

};

const ErrorHandler = class ErrorHandler {

  constructor(errorId) {
    const idToErrorClassDictionary = {
      7: new AuthorizationError(errorId),
      8: new AuthorizationError(errorId),
      14: new AuthorizationError(errorId),
      48: new AuthorizationError(errorId),
      49: new AuthorizationError(errorId),
      50: new AuthorizationError(errorId),
      123: new AuthorizationError(errorId),

      10: new ConnectionHandlingError(errorId),
      13: new ConnectionHandlingError(errorId),
      51: new ConnectionHandlingError(errorId),
      52: new ConnectionHandlingError(errorId),
      53: new ConnectionHandlingError(errorId),

      32: new ObjectHandlingError(errorId),

      16: new AttributeHandlingError(errorId),
      17: new AttributeHandlingError(errorId),
      18: new AttributeHandlingError(errorId),
      21: new AttributeHandlingError(errorId),
    };
    const errorObject = idToErrorClassDictionary[errorId];
    return (errorObject);
  }

};

module.exports = ErrorHandler;
