'use strict';

const ldif = require('ldif');

function constructLdifString(ldifString) {
  let resultJSON;

  try {
    resultJSON = ldifString === '' ? ldifString : ldif.parse(ldifString);
    return resultJSON;
  } catch (ldifErr) {

    const errorMsg = 'Expected DN, WHITESPACE, entry or version but "d" found.';
    if (ldifErr.message !== errorMsg) {
      throw ldifErr;
    }

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
      const elementLength = element.trim().length;

      /* This is a hack for the error that comes from the node-ldif library
        When the dn is empty */
      if (attribute === dnAttrKey && value === dnVal && elementLength === 3) {
        const newLdifString = ldifString.replace(`${dnAttrKey}${filter}${dnVal}`,
          `${dnAttrKey}${filter}${dnVal}${giveDNVal}`);
        resultJSON = ldif.parse(newLdifString);
        resultJSON.entries[0].dn = ' ';
      }
    });

    return resultJSON;
  }
}

module.exports = constructLdifString;
