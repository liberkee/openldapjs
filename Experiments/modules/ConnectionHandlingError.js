'use strict'

module.exports = class ConnectionHandlingError {

  constructor(errorId) {
    const IdToErrorDictionary = {
      10: 'Referral',
      13: 'Confidentiality Required',
      51: 'Busy',
      52: 'Unavailable',
      53: 'Unwilling to Perform',
    };

    const IdToTextDictionary = {
      10: 'This indicates that the server could not process the requested operation, but that it may succeed if attempted in another location, as specified by the referral URIs included in the response.',
      13: 'This indicates that the requested operation is only allowed over a secure connection.',
      51: 'This indicates that the server is currently too busy to process the requested operation.',
      52: 'This indicates that the server is currently unavailable (e.g., because it is being shut down or is in a maintenance state).',
      53: 'This indicates that the server is unwilling to process the requested operation for some reason.',
    }

    this.errorClassName = 'Connection Handling Error';
    this.errorName = IdToErrorDictionary[errorId];
    this.errorText = IdToTextDictionary[errorId];
  }
}