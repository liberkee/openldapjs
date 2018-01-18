'use strict';

const async = require('async');

const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

const opts = {
  scope: 'sub',
};

function search(ldapClient, cb) {
  async.times(config.entryCount, (n, next) => {
    ldapClient.search(config.dummyOu, opts, (err, res) => {
      if (err) {
        console.error('oops', err);
      } else {
        res.on('end', () => {
          next(err, 'ok');
        });

        res.on('error', () => {
          next(err, 'ok');
        });
      }
    });
  }, (err, elements) => {
    cb(err, ldapClient);
  });
}

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

