'use strict';

const ldif = require('ldif');

function constructLdif(ldifString) {
  const ldifObject = {
    type: 'content',
    version: null,
    entries: [],
  };
  const resultArr = ldifString.split('\n');
  const entryObject = {
    type: 'record',
    dn: '',
    attributes: [],
  };

  resultArr.forEach((element, index, array) => {
    if (element.trim()) {
      const elementArr = element.split(':');
      const objectKey = elementArr[0];
      const objectVal = elementArr[1];
      if (objectKey !== 'dn') {
        const constructAttrObj = {
          attribute: {
            type: 'attribute',
            options: [],
            attribute: objectKey,
          },
          value:
          {
            type: 'value',
            value: objectVal,
          },
        };
        entryObject.attributes.push(constructAttrObj);
      } else {
        entryObject.dn = objectVal;
      }
    } else if (index === array.length - 1) {
      ldifObject.entries.push(entryObject);
    }
  });
  return ldifObject;
}

function constructLdifString(ldifString, error) {
  const errorMsg = 'Expected DN, WHITESPACE, entry or version but "d" found.';
  if (error.message !== errorMsg) {
    throw error;
  }

  let resultJSON;
  const ldifStringArr = ldifString.split('\n');
  const arrayElements = [];
  ldifStringArr.forEach((element) => {
    if (element.trim()) {
      arrayElements.push(element);
    }
  });

  arrayElements.forEach((element) => {
    const dnAttrKey = 'dn';
    const dnVal = ' ';
    const filter = ':';
    const giveDNVal = 'defaultName';
    const elementSplit = element.split(':');
    const attribute = elementSplit[0];
    const value = elementSplit[1];

    if (attribute === dnAttrKey && value === dnVal) {
      const newLdifString = ldifString.replace(`${dnAttrKey}${filter}${dnVal}`,
        `${dnAttrKey}${filter}${dnVal}${giveDNVal}`);
      resultJSON = ldif.parse(newLdifString);
      resultJSON.entries[0].dn = ' ';
    }
  });
  return resultJSON;
}

module.exports = constructLdifString;
