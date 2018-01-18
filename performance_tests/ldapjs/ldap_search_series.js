'use strict';

const async = require('async');

const shared = require('./shared');
const config = require('./../config');

const opts = {
  scope: 'sub',
};

const steps = [
  shared.bind,
  search,
  shared.unbind,
];

const t0 = shared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
  } else {
    const duration = shared.asSeconds(shared.takeSnap(t0));
    console.log(`Search [${config.entryCount}] took: ${duration} s`);

  }
});

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
