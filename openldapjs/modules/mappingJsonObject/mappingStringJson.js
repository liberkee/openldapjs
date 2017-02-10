'use strict';

class stringJSON {

  stringToJSONlocalObject(stringReturn) {
    this.JSONobject = [];

    let i;

    const entryObject = {
      dn: '',
      attribute: [],
    };

    // String first verification
    if (stringReturn === '') {
      // throw 'ERROR: Empty string';
      return;
    }
    if (isNaN(stringReturn) === false) {
      // throw 'ERROR: Must string';
      return;
    }

    // define the array of the mesage
    const searchSplitArray = stringReturn.split('\n');
    const lengthSearchSplitArray = searchSplitArray.length;

    // Interogate the Search Array
    for (i = 0; i < lengthSearchSplitArray; i += 1) {
      // Create a local object that will be used to push the element to the JSONobject
      const newentryObject = {
        dn: '',
        attribute: [],
      };
      const arraySplitOperation = searchSplitArray[i].split(':');

      if (i + 1 === lengthSearchSplitArray) {
        newentryObject.dn = entryObject.dn;
        newentryObject.attribute = entryObject.attribute;
        this.JSONobject.push(newentryObject);
      }
      // Verify if the array have null string and ignore it
      if (searchSplitArray[i] === '') {
        continue;
      }
      // First element of the arraySplitOperation is the type and the second the attribute
      if (arraySplitOperation[0] === 'dn') {
        if (entryObject.dn !== '') {
          newentryObject.dn = entryObject.dn;
          newentryObject.attribute = entryObject.attribute;
          this.JSONobject.push(newentryObject);
          entryObject.attribute = [];
        }
        entryObject.dn = arraySplitOperation[1];
      } else {
        const attributesObject = {
          type: '',
          value: '',
        };
        // Fill the attributesObject with the type and value then push it to the entryObject
        attributesObject.type = arraySplitOperation[0];
        attributesObject.value = arraySplitOperation[1];
        entryObject.attribute.push(attributesObject);
      }
    }
  }

  stringToJSONwithNewInstance(stringReturn) {
    // Define the global object
    this.JSONobject = {
      length: 0,
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
    // String first verification
    if (stringReturn === '') {
      return;
    }

    if (isNaN(stringReturn) === false) {
      return;
    }

    // define the array of the mesage
    const searchSplitArray = stringReturn.split('\n');
    const lengthSearchSplitArray = searchSplitArray.length;

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
      }

      // Verify if the array have null string and ignore it
      if (searchSplitArray[i] === '') {
        continue;
      }
      // First element of the arraySplitOperation is the type and the second is value
      if (arraySplitOperation[0] === 'dn') {
        // Verify if new entry
        if (entryObject.dn !== '') {

            // Register the entry object in JSON
          entryObject.attribute.push(attributesObject);
          this.JSONobject.entry.push(entryObject);

            // create new instance of attributesObject
          attributesObject = new Object({
            type: '',
            value: [],
          });
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
          if (attributesObject.type !== arraySplitOperation[0] && attributesObject.type !== '') {
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
        }
      }
    }
  }

}

module.exports = stringJSON;
