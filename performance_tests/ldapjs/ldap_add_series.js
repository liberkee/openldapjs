'use strict';

const async = require('async');

const shared = require('./shared');
const config = require('./../config');

const opts = {
  scope: 'sub',
};

const steps = [
  shared.bind,
  add,
  shared.unbind,
];

const t0 = shared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
  } else {
    const duration = shared.asSeconds(shared.takeSnap(t0));
    console.log(`Add [${config.entryCount}] took: ${duration} s`);

  }
});

function add(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.add(`cn=person_${n},${config.dummyOu}`, config.sampleEntry, (err) => {
      next(err, 'ok');
    });
  }, (err, elements) => {
    cb(err, ldapClient);
  });
}
