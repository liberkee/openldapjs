'use strict';

const async = require('async');

const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

function compare(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.compare(config.bindDn, 'objectClass', 'simpleSecurityObject', (err, matched) => {
      next(err, 'ok');
    });
  }, (err, elements) => {
    cb(err, ldapClient);
  });
}

const steps = [
  shared.bind,
  compare,
  shared.unbind,
];

const t0 = gShared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
    shared.unbind();
  } else {
    const duration = gShared.asSeconds(gShared.takeSnap(t0));
    console.log(`Compare [${config.entryCount}] took: ${duration} s`);

  }
});
