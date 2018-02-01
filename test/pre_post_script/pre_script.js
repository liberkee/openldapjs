'use strict';

const configFile = require('../config.json');
const Client = require('../../index').Client;
const Promise = require('bluebird');


/**
 * Helper script that is used to make tests without dependence.
 */

const rdnAdd = configFile.ldapDelete.rdnUser;
const dnAdd = configFile.ldapDelete.dn;

const rdnDelete = configFile.ldapAdd.rdnUser;
const dnDelete = configFile.ldapAdd.dnNewEntry;

const validEntry = [
  configFile.ldapAdd.firstAttr,
  configFile.ldapAdd.secondAttr,
  configFile.ldapAdd.lastAttr,
];

const changeAttributesReplace = [
  {
    op: configFile.ldapModify.ldapModificationReplace.operation,
    attr: configFile.ldapModify.ldapModificationReplace.attribute,
    vals: configFile.ldapModify.ldapModificationReplace.vals,
  },
];

const changeAttributes = [
  changeAttributesReplace,
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
    const argsAdd = [];
    const argsDelete = [];
    for (let i = 0; i < 10; i += 1) {
      argsAdd.push(`${rdnAdd}${i}${dnAdd}`);
      argsDelete.push(`${rdnDelete}${i}${dnDelete}`);
    }

    /* For LDAP rename operation */
    const deleteOp = ldapClient.delete(`${configFile.ldapRename.newrdn},${configFile.ldapRename.newparent}`);
    /* For LDAP delete operation */
    const promiseDeleteRes = Promise.map(argsDelete, (arg) => {
      return ldapClient.delete(arg);
    });
    /* For LDAP modify operation */
    const modifyOp1 = ldapClient.modify(configFile.ldapModify.ldapModificationReplace.change_dn,
      changeAttributes);
    const modifyOp2 = ldapClient.modify(configFile.ldapModify.ldapModificationUpdate.change_dn,
      changeAttributesReplace);
    /* For LDAP rename operation */
    const addOp = ldapClient.add(configFile.ldapRename.dnChange, validEntry);
    /* For LDAP add operation */
    const promiseAddRes = Promise.map(argsAdd, (arg) => {
      return ldapClient.add(arg, validEntry);
    });

    return Promise.all([deleteOp, promiseDeleteRes, modifyOp1, modifyOp2, addOp, promiseAddRes]
      .map((p) => {
        return p.catch((e) => {
          return e;
        });
      }));
  });
