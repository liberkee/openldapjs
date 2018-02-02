'use strict';

const configFile = require('../config.json');
const Client = require('../../index').Client;
const Promise = require('bluebird');


/**
 * Helper script that adds a bunch of test entries using the library add routine.
 */

const rdn = 'cn=testUser';
const dn = configFile.ldapTestEntries.entryDn;
const validEntryObject = [
  {
    attr: 'objectClass',
    vals: ['person'],
  },
  {
    attr: 'description',
    vals: ['testData'],
  },
  {
    attr: 'cn',
    vals: ['test'],
  },
  {
    attr: 'sn',
    vals: ['test'],
  },


];


const ldapClient = new Client(configFile.ldapAuthentication.host);

ldapClient.initialize()
  .then(() => {
    return ldapClient.bind(
      configFile.ldapAuthentication.dnAdmin,
      configFile.ldapAuthentication.passwordAdmin);
  })
  .then(() => {
    ldapClient.add(dn, validEntryObject)
      .then(() => {
        const args = [];
        for (let i = 0; i < 10000; i++) {
          args.push(`${`${rdn + i}`},${dn}`);
        }

        Promise.map(args, (arg) => {
          return ldapClient.add(arg, validEntryObject);
        }, {concurrency: 4});
      });
  });
