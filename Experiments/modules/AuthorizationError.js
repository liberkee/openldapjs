'use strict'

module.exports = class AuthorizationError {

  constructor(errorId) {
    const IdToErrorDictionary = {
      7: 'Authentication Method Not Supported',
      8: 'Stronger Authentication Required',
      14: 'SASL Bind in Progress',
      48: 'Inappropriate Authentication',
      50: 'Insufficient Access Rights',
      123: 'Authorization Denied',
    };

    const IdToTextDictionary = {
      7: 'This indicates that a bind operation failed because the server does not support the requested authentication type',
      8: 'This indicates that the server requires that the client be authenticated with a stronger mechanism than has previously been performed in order to process the request. This result code may be used in a notice of disconnection unsolicited notification if the server believes that the security of the connection has been compromised.',
      14: 'This indicates that the server requires more information from the client in order to complete the SASL bind operation. In such responses, the "server SASL credentials" element of the result message will often include information the client needs for subsequent phases of bind processing.',
      48: 'This indicates that the client attempted to bind as a user that does not exist, attempted to bind as a user that is not allowed to bind (e.g., because it has expired, because it has been locked because of too many failed authentication attempts, etc.), or attempted to bind with credentials that were not correct for the target user.',
      50: 'This indicates that the client does not have permission to perform the requested operation.',
      123: 'This indicates that the requested operation could not be processed because the request included a proxied authorization request control (or some similar control intended to specify an alternate authorization identity for the operation), but the client was not allowed to request the use of that alternate authorization identity.',

    }

    this.errorClassName = 'Authorization Error';
    this.errorName = IdToErrorDictionary[errorId];
    this.errorText = IdToTextDictionary[errorId];
  }
}
