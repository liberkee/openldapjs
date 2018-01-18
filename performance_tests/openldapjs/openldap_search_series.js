'use strict';

const async = require('async');

const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

const steps = [
  shared.bind,
  search,
  shared.unbind,
];

const t0 = gShared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
  } else {
    const duration = gShared.asSeconds(gShared.takeSnap(t0));
    console.log(`Search [${config.entryCount}] took: ${duration} s`);

  }
});

function search(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.search(config.dummyOu, 'SUBTREE', 'objectClass=*')
      .asCallback(next);
  }, (err, elements) => {
    cb(err);
  });
}
