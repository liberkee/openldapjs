'use strict';

const configFile = require('../config.json');
const Client = require('../../index').Client;
const Promise = require('bluebird');


/**
 * Helper script that is used to make tests without dependence.
 */

const rdn = configFile.ldapDelete.rdnUser;
const dn = configFile.ldapDelete.dn;
const validEntry = [
  configFile.ldapAdd.firstAttr,
  configFile.ldapAdd.secondAttr,
  configFile.ldapAdd.lastAttr,
];

const changeAttributes = [
  {
    op: configFile.ldapModify.ldapModificationReplace.operation,
    attr: configFile.ldapModify.ldapModificationReplace.attribute,
    vals: configFile.ldapModify.ldapModificationReplace.vals,
  },
  {
    op: configFile.ldapModify.ldapModificationAdd.operation,
    attr: configFile.ldapModify.ldapModificationDelete.attribute,
    vals: configFile.ldapModify.ldapModificationDelete.vals,
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
    const args = [];
    for (let i = 0; i < 10; i += 1) {
      args.push(`${rdn}${i}${dn}`);
    }

    /* For LDAP modify operation */
    const modifyOp = ldapClient.modify(configFile.ldapModify.ldapModificationReplace.change_dn,
      changeAttributes);
    /* For LDAP rename operation */
    const addOp = ldapClient.add(configFile.ldapRename.dnChange, validEntry);
    /* For LDAP delete operation */
    const promiseRes = Promise.map(args, (arg) => {
      return ldapClient.add(arg, validEntry);
    });

    return Promise.all([modifyOp, addOp, promiseRes]
      .map((p) => {
        return p.catch((e) => {
          return e;
        });
      }));
  });
