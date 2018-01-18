'use strict';

const async = require('async');

const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

function add(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.add(`cn=person_${n},${config.dummyOu}`, config.sampleEntry, (err) => {
      next(err, 'ok');
    });
  }, (err, elements) => {
    cb(err, ldapClient);
  });
}

const steps = [
  shared.bind,
  add,
  shared.unbind,
];

const t0 = gShared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
    shared.unbind();
  } else {
    const duration = gShared.asSeconds(gShared.takeSnap(t0));
    console.log(`Add [${config.entryCount}] took: ${duration} s`);
  }
});

