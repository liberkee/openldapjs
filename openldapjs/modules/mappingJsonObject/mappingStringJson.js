'use strict';

class stringJSON {
  constructor() {
    this.JSONobject = [];
  }; 

  stringToJSON(stringReturn) {
    let i;
    let entryObject = {
      dn: '',
      attribute: [],
    };
  //String first verification
    if(stringReturn === '') {
      console.log('ERROR: The string is empty.');
      return;
    }
    if(isNaN(stringReturn) === false) {
      console.log('ERROR: Must string');
      return;
    }

    //define the array of the mesage
    const searchSplitArray = stringReturn.split('\n');
    const lengthSearchSplitArray = searchSplitArray.length;

    // Interogate the Search Array
    for (i=0; i < lengthSearchSplitArray; i++) {
      //Create a local object that will be used to push the element to the JSONobject
      let newentryObject = {
        dn: '',
        attribute: [],
      };
      const arraySplitOperation = searchSplitArray[i].split(':');

      if (i+1 == lengthSearchSplitArray) {
        newentryObject.dn = entryObject.dn;
        newentryObject.attribute = entryObject.attribute;
        this.JSONobject.push(newentryObject);      
      }
      //Verify if the array have null string and ignore it
      if (searchSplitArray[i] === '') {
        continue;
      }
      //First element of the arraySplitOperation is the type and the second the attribute
      if (arraySplitOperation[0] === 'dn') {
        if (entryObject.dn !== '') {
          newentryObject.dn = entryObject.dn;
          newentryObject.attribute = entryObject.attribute;
          this.JSONobject.push(newentryObject);   
          entryObject.attribute = [];
        }
        entryObject.dn = arraySplitOperation[1];
      }
      else {
        let attributesObject = {
          type: '',
          value: '',
        };
        //Fill the attributesObject with the type and value then push it to the entryObject
        attributesObject.type = arraySplitOperation[0];
        attributesObject.value = arraySplitOperation[1];
        entryObject.attribute.push(attributesObject);
      }
    }
  }
}

module.exports = stringJSON;
