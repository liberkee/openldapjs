'use strict';

const async = require('async');

const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

function del(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.del(`cn=person_${n},${config.dummyOu}`, (err) => {
      next(err, 'ok');
    });
  }, (err, elements) => {
    cb(err, ldapClient);
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

