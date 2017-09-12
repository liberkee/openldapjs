'use strict';

const Promise = require('bluebird');

/**
   * Interogate the attribute array by his type to see if exist
   *
   * @function alreadyExist
   * @param {array} attributeObjectArray
   * @param {string} type
   * @return {object} The function will return an object if the type exist.
   * Undefined otherwise
   */
function alreadyExist(attributeObjectArray, type) {
  const lengthArray = attributeObjectArray.length;
  for (let j = 0; j < lengthArray; j += 1) {
    if (attributeObjectArray[j].type === type) {
      return attributeObjectArray[j];
    }
  }
  return undefined;
}

/**
   * Return the object of an Attribute.
   *
   * @function objectLDAPAttribute
   * @param {string} type
   * @param {string} value
   * @return {object} The function will return an object of attribute
   */

function objectLDAPAttribute(type, value) {
  const attributeObject = ({
    type: '',
    value: [],
  });

  attributeObject.type = type;
  attributeObject.value.push(value);

  return attributeObject;
}

/**
   * Take an entry of LDAP and put it into an object.
   *
   * @function objectLDAPEntry
   * @param {string} LDAPentry
   * @return {object} The function will return an object of given entry
   */

function objectLDAPEntry(LDAPentry) {
  const entryElementArray = LDAPentry.split('\n');
  const entryElementArrayLenght = entryElementArray.length;
  let i;

  const entryObject = ({
    dn: '',
    attribute: [],
  });

  for (i = 0; i < entryElementArrayLenght; i += 1) {
    const attributeArray = entryElementArray[i].split(':');

    const type = attributeArray[0];
    const value = attributeArray[1];

    // Verify if is an attribute or the DN
    if (type !== '' && type !== undefined) {
      const currentType = alreadyExist(entryObject.attribute, type);

      // Verify if the type alreadyExist
      if (currentType) {
        currentType.value.push(value);
      } else {
        const attributeResult = objectLDAPAttribute(type, value);
        entryObject.attribute.push(attributeResult);
      }

    } else if (type !== undefined && value !== undefined) {
      entryObject.dn = value;
    }
  }
  return entryObject;
}

/**
 * @module LDAPtranzition
 * @class stringJSON
 */

class stringJSON {
  /**
    * Transform a string message from LDAP search operation to JSON.
    *
    * @method stringLDAPtoJSON
    * @param {string} LDAPstring
    * @return {Promise} That resolves if the stringLDAPtoJSON was successful.
    * Rejects if is not a string and don't have the LDIF structure.
    */

  stringLDAPtoJSON(LDAPstring) {
    return new Promise((resolve, reject) => {

      this.JSONobject = {
        entry: [],
      };

      // Test to interogate the given string
      if (LDAPstring === null) {
        reject(new Error('The string is null'));
      }

      if (LDAPstring === '') {
        reject(new Error('The string is empty'));
      }

      if (LDAPstring === undefined) {
        reject(new Error('The string is undefined'));
      }

      if (isNaN(LDAPstring) === false) {
        reject(new Error('Must be a string'));
      }

      // If basic test are past interogate to see if is an Ldap structure
      const entryArray = LDAPstring.split('\ndn');
      const lengthEntryArray = entryArray.length;

      if (lengthEntryArray <= 1) {
        reject(new Error('The string is not a LDAP structure'));
      }

      for (let i = 1; i < lengthEntryArray; i += 1) {
        const entryObject = objectLDAPEntry(entryArray[i]);
        this.JSONobject.entry.push(entryObject);
      }
      resolve(this.JSONobject);
    });
  }
}

module.exports = stringJSON;
