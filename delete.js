'use strict';

const fs = require('fs');

const content = fs.readFileSync('./deleteThis.ldif', 'utf8');

function startsWithDn(element) {
  return element.startsWith('dn:');
}


const array = content.split('\n');

const cnArray = array.filter(startsWithDn);


const result = [];

cnArray.forEach((element) => {
  fs.appendFileSync('deleteEntries.ldif', `${element.slice(4)}\n`);
});
