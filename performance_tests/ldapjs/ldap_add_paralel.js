'use strict';

const ldap = require('ldapjs');
const config = require('./../config');
const gShared = require('./../global_shared');

const Promise = require('bluebird');

const ldapPromisified = Promise.promisifyAll(ldap);

const t0 = gShared.takeSnap();


const adminClient = ldapPromisified.createClient({url: config.url});

adminClient.bind(config.bindDn, config.password, (err) => {

  if (err) {
    console.log(`stuff went wrong${err}`);
  } else {
    const args = [];
    for (let i = 0; i < config.entryCount; i++) {
      args.push(`cn=dummy${i},${config.dummyOu}`);

    }

    Promise.map(args, (arg) => {
      return adminClient.addAsync(arg, config.sampleEntry);
    }, {concurrency: 4})
      .then(() => {
        const duration = gShared.asSeconds(gShared.takeSnap(t0));
        console.log(`Add [${config.entryCount}] took: ${duration} s`);

        adminClient.unbind();

      });


  }
});

