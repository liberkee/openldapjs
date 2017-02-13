'use strict';

const Promise = require('bluebird');

class stringJSON {

  stringToJSONwithNewInstance(stringReturn) {
    return new Promise((resolve, reject) => {
    // Define the global object
      this.JSONobject = {
        entry: [],
      };

      let entryObject = {
        dn: '',
        attribute: [],
      };

      let attributesObject = {
        type: '',
        value: [],
      };

      let i;
      let flagLastAttributeCatch = false;
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
      const searchSplitArray = stringReturn.split('\n');
      const lengthSearchSplitArray = searchSplitArray.length;
      if (lengthSearchSplitArray <= 1) {
        reject(new Error('The string is not a LDAP structure'));
      }
      // Interogate the Search Array
      for (i = 0; i < lengthSearchSplitArray; i += 1) {
        // Split the message in two
        const arraySplitOperation = searchSplitArray[i].split(':');
        // Verify if is end of the search
        if (i + 1 === lengthSearchSplitArray) {

          // Register the entry object in JSON
          // The last row is always empty
          entryObject.attribute.push(attributesObject);
          this.JSONobject.entry.push(entryObject);
          resolve(this.JSONobject.entry);
        }

        // Verify if the array have null string and ignore it
        if (searchSplitArray[i] === '') {
          continue;
        }
        // First element of the arraySplitOperation is the type and the second is value
        if (arraySplitOperation[0] === 'dn') {
          // Verify if new entry
          if (entryObject.dn !== '') {
            flagLastAttributeCatch = true;
              // Register the entry object in JSON
            entryObject.attribute.push(attributesObject);
            this.JSONobject.entry.push(entryObject);

          }
          // create new instance of entryObject
          entryObject = new Object({
            dn: '',
            attribute: [],
          });
          entryObject.dn = arraySplitOperation[1];
        // If is attribute
        } else {

          // verify if the attribute have multiple values
          if (attributesObject.type === arraySplitOperation[0]) {
            attributesObject.value.push(arraySplitOperation[1]);
          } else {
            // Push the attributesObject if new attribute
            if (attributesObject.type !== arraySplitOperation[0] &&
                attributesObject.type !== '' &&
                flagLastAttributeCatch === false) {
              entryObject.attribute.push(attributesObject); // I have to asignet
            }
            // create new object of attributesObject
            attributesObject = new Object({
              type: '',
              value: [],
            });
            // set the parameters
            attributesObject.type = arraySplitOperation[0];
            attributesObject.value.push(arraySplitOperation[1]);
            flagLastAttributeCatch = false;
          }
        }
      }
    });
  }

}

module.exports = stringJSON;
