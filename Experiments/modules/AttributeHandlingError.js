'use strict'

module.exports = class AttributeHandingError {

  constructor(errorId) {
    const IdToErrorDictionary = {
      16: 'No Such Attribute',
      17: 'Undefined Attribute Type',
      18: 'Inappropriate Matching',
      21: 'Invalid Attribute Syntax',
    };

    const IdToTextDictionary = {
      16: 'This indicates that the client attempted to interact with an attribute that does not exist in the target entry (e.g., to remove an attribute or value that does not exist).',
      17: 'This indicates that the client request included an attribute type that is not defined in the server schema.',
      18: 'This indicates that the client request attempted to perform an unsupported type of matching against an attribute. For example, this may be used if the attribute type does not have an appropriate matching rule for the type of matching requested for that attribute.',
      21: 'This indicates that the client request would have resulted in an attribute value that did not conform to the syntax for that attribute type.',
    }

    this.errorClassName = 'Attribute Handling Error';
    this.errorName = IdToErrorDictionary[errorId];
    this.errorText = IdToTextDictionary[errorId];
  }
}