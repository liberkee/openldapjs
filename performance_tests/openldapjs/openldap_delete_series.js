'use strict';

const async = require('async');

const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

function del(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.delete(`cn=person_${n},${config.dummyOu}`, [])
      .asCallback(next);
  }, (err, elements) => {
    cb(err);
  });
}

const steps = [
  shared.bind,
  del,
  shared.unbind,
];

const t0 = gShared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
  } else {
    const duration = gShared.asSeconds(gShared.takeSnap(t0));
    console.log(`Delete [${config.entryCount}] took: ${duration} s`);

  }
});


