'use strict';

const json2ts = require('json2ts');
const fs = require('fs');
const packageTest = require('../../test/error_list.json');

const result = json2ts.convert(JSON.stringify(packageTest));
fs.writeFile('error_list.ts', result, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Success');
});
console.log(result);
