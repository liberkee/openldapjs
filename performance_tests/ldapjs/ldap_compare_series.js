'use strict';

const async = require('async');

const shared = require('./shared');
const config = require('./../config');

const opts = {
  scope: 'sub',
};

const steps = [
  shared.bind,
  compare,
  shared.unbind,
];

const t0 = shared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
  } else {
    const duration = shared.asSeconds(shared.takeSnap(t0));
    console.log(`Compare [${config.entryCount}] took: ${duration} s`);

  }
});

function compare(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.compare(config.bindDn, 'objectClass', 'simpleSecurityObject', (err, matched) => {
      next(err, 'ok');
    });
  }, (err, elements) => {
    cb(err, ldapClient);
  });
}
