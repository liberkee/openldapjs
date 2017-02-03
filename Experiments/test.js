'use strict';

const objectwrapper = require('./build/Release/binding');

let i = 0;
for (i = 0; i < 2000; i++) {
  console.log(i);
  const obj = new objectwrapper.MyObject(i);
}
