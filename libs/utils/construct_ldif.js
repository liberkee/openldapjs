'use strict';

function constructLdif(ldifString) {
  const ldifObject = {
    type: 'content',
    version: null,
    entries: [],
  };
  const resultArr = ldifString.split('\n');
  const entryElement = ldifString.split('dn:');
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

module.exports = constructLdif;
