'use strict';

const client = require('../addonFile/build/Release/binding.node');
const Promise = require('bluebird');

const newClient = new client.LDAPClient();

/**
 * @module LDAPtranzition
 * @class LDAPWrapAsync
 */

module.exports = class LDAPWrapAsync {

 /**
   * Initialize to an LDAP server.
   *
   * @method initialize
   * @param {string} host The host address of server LDAP.
   * @return {Promise} That resolves if the LDAP initialize the structure to a specific server.
   * Reject if the address is incorect.
   */

  initialize(host) {
    return new Promise((resolve, reject) => {
      newClient.initialize(host, (err, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Authentificate to LDAP server.
   *
   * @method bind
   * @param {string} username The username of specific client.
   * @param {string} password The password for authentification.
   * @return {Promise} That resolves if the credentials are correct.
   * Reject dn or password are incorect.
   */

  bind(username, password) {
    return new Promise((resolve, reject) => {
      newClient.bind(username, password, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }, (progress) => {
        console.log('In progress');
      });
    });
  }

 /**
   * Unbind from a LDAP server.
   *
   * @method unbind
   * @return {Promise} That resolves if the LDAP structure was initialized.
   * Reject if the LDAP structure was not set or initialized.
   */
  unbind() {
    return new Promise((resolve, reject) => {
      newClient.unbind((err, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }

};
