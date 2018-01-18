'use strict';

const async = require('async');

const shared = require('./shared');
const config = require('./../config');

const opts = {
  scope: 'sub',
};

const steps = [
  shared.bind,
  del,
  shared.unbind,
];

const t0 = shared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
  } else {
    const duration = shared.asSeconds(shared.takeSnap(t0));
    console.log(`Delete [${config.entryCount}] took: ${duration} s`);

  }
});

function del(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.del(`cn=person_${n},${config.dummyOu}`, (err) => {
      next(err, 'ok');
    });
  }, (err, elements) => {
    cb(err, ldapClient);
  });
}
