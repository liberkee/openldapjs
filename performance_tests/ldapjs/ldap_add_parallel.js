'use strict';

const async = require('async');
const shared = require('./shared');
const gShared = require('./../global_shared');
const config = require('./../config');

const ldap = require('ldapjs');


const adminClient = ldap.createClient({url: config.url});

adminClient.bind(config.bindDn, config.password, (err) => {

  if (err) {
    console.log(`stuff went wrong${err}`);
    adminClient.unbind();
    process.exit();
  } else {
    const t0 = gShared.takeSnap();
    async.times(config.entryCount, (n, next) => {
      adminClient.add(`cn=person_${n},${config.dummyOu}`, config.sampleEntry, (addError) => {
        next(addError, 'ok');
      });
    }, (timesError, elements) => {
      if (timesError) {
        console.log(`shit went wrong: ${timesError}`);
        adminClient.unbind();
        process.exit();
      }
      const duration = gShared.asSeconds(gShared.takeSnap(t0));
      console.log(`Add [${config.entryCount}] took: ${duration} s`);
      adminClient.unbind();

    });
  }
});

