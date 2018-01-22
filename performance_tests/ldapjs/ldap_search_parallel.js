'use strict';

const async = require('async');
const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

const ldap = require('ldapjs');


const adminClient = ldap.createClient({url: config.url});


const opts = {
  scope: 'sub',
};

adminClient.bind(config.bindDn, config.password, (err) => {

  if (err) {
    console.log(`stuff went wrong${err}`);
    adminClient.unbind();
    process.exit();
  } else {
    const t0 = gShared.takeSnap();
    async.times(config.entryCount, (n, next) => {
      adminClient.search(config.dummyOu, opts, (searchError, res) => {
        if (searchError) {
          console.error('oops', searchError);
        } else {
          res.on('end', () => {
            next(searchError, 'ok');
          });

          res.on('error', () => {
            next(searchError, 'ok');
          });
        }
      });

    });
    const duration = gShared.asSeconds(gShared.takeSnap(t0));
    console.log(`Searching [${config.entryCount}] took: ${duration} s`);
    adminClient.unbind();
  }
});

