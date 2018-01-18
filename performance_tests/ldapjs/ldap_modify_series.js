'use strict';

const async = require('async');

const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

const change = {
  operation: 'replace',
  modification: {
    sn: 'boox',
  },
};

function modify(ldapClient, cb) {
  change.modification.sn = new Date().toISOString();
  async.times(config.entryCount, (n, next) => {
    ldapClient.modify(`cn=person_${n},${config.dummyOu}`, change, (err) => {
      next(err, 'ok');
    });
  }, (err, elements) => {
    cb(err, ldapClient);
  });
}

const steps = [
  shared.bind,
  modify,
  shared.unbind,
];

const t0 = gShared.takeSnap();
async.waterfall(steps, (err) => {
  if (err) {
    console.log('oww', err);
    shared.unbind();
  } else {
    const duration = gShared.asSeconds(gShared.takeSnap(t0));
    console.log(`Modify [${config.entryCount}] took: ${duration} s`);

  }
});


