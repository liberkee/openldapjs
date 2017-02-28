'use strict';

const Promise = require('bluebird');

/**
   * Interogate an array by his type to see if exist
   *
   * @function alreadyExist
   * @param {object} array
   * @param {type} string
   * @return {int} The function will return the index of the array if the type was already set.
   * If the type don't exist in the array will return 0 or false
   */
function alreadyExist(array, type) {
  const lengthArray = array.length;
  for (let j = 0; j < lengthArray; j += 1) {
    if (array[j].type === type) {
      return j;
    }
  }
  return false;
}

/**
   * Take an entry of LDAP and put it into an object.
   *
   * @function stringToJSONwithNewInstance
   * @param {string} entry
   * @return {object} The function will return an object of given entry
   */

function objectEntry(entry) {
  // Make an Array of the entry
  const entrySplit = entry.split('\n');
  // Flag for the type attribute
  let exist = false;

  const entryObject = ({
    dn: '',
    attribute: [],
  });

  let attributesObject = ({
    type: '',
    value: [],
  });
  // Interogate the entry
  for (let i = 0; i < entrySplit.length; i += 1) {
    // Define the value and the type of an attribute
    const attributeSplit = entrySplit[i].split(':');
    const type = attributeSplit[0];
    const value = attributeSplit[1];
    // Execute the function for verification
    exist = alreadyExist(entryObject.attribute, type);
    // Verifi if the type is entry or not
    if (type !== '' && type !== undefined) {
      attributesObject = ({
        type: '',
        value: [],
      });

      attributesObject.type = type;
      attributesObject.value.push(value);

      if (exist) {
        const index = exist;
        const attributePozition = entryObject.attribute[index].value;
        attributePozition.push(value);
        exist = false;
      } else if (attributesObject.type !== '' && attributesObject.value !== []) {
        entryObject.attribute.push(attributesObject);
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
   * @method stringToJSONwithNewInstance
   * @param {string} stringReturn
   * @return {Promise} That resolves if the stringToJSONwithNewInstance was successful.
   * Rejects if is not a string and don't have the LDIF structure.
   */

  stringToJSONwithNewInstance(stringReturn) {
    return new Promise((resolve, reject) => {
    // Define the global object
      this.JSONobject = {
        entry: [],
      };

      // String first verification
      if (stringReturn === null) {
        reject(new Error('The string is null'));
      }

      if (stringReturn === '') {
        reject(new Error('The string is empty'));
      }

      if (stringReturn === undefined) {
        reject(new Error('The string is undefined'));
      }

      if (isNaN(stringReturn) === false) {
        reject(new Error('Must be a string'));
      }
      // define the array of the mesage
      const searchSplitArray = stringReturn.split('\ndn');
      const lengthSearchSplitArray = searchSplitArray.length;
      if (lengthSearchSplitArray <= 1) {
        reject(new Error('The string is not a LDAP structure'));
      }
      // Interogate the Search Array
      for (let i = 1; i < lengthSearchSplitArray; i += 1) {
        const result = objectEntry(searchSplitArray[i]);
        this.JSONobject.entry.push(result);
      }
      resolve(this.JSONobject);
    });
  }

}

module.exports = stringJSON;
