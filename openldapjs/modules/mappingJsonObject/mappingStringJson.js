'use strict';

const Promise = require('bluebird');

/**
   * Interogate the attribute array by his type to see if exist
   *
   * @function alreadyExist
   * @param {array} attributeObjectArray
   * @param {string} type
   * @return {int} The function will return the index of the array if the type was already set.
   * If the type don't exist in the array will return 0 or false
   */
function alreadyExist(attributeObjectArray, type) {
  const lengthArray = attributeObjectArray.length;
  for (let j = 0; j < lengthArray; j += 1) {
    if (attributeObjectArray[j].type === type) {
      return j;
    }
  }
  return false;
}

/**
   * Interogate an attribute by his type and value.
   *
   * @function objectLDAPAttribute
   * @param {string} type
   * @param {string} value
   * @param {int} typeExist
   * @return {object} The function will return an object of attribute
   * if the type is non-existent in entryObject or the index
   */

function objectLDAPAttribute(type, value, typeExist) {
  const attributeObject = ({
    type: '',
    value: [],
  });

  attributeObject.type = type;
  attributeObject.value.push(value);

  if (typeExist) {
    const indexOfType = typeExist;
    return indexOfType;
  }

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

      const typeInterogation = alreadyExist(entryObject.attribute, type);
      const attributeResult = objectLDAPAttribute(type, value, typeInterogation);

      // If the attributeResult is not an object then will
      // return the index of the pozition for the entry
      if (!isNaN(attributeResult)) {
        entryObject.attribute[attributeResult].value.push(value);
      } else {
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
