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
        if (result) {
          resolve(result);
        } else {
          reject(err);
        }
      }, (progress) => {
        console.log('In progress');
      });
    });
  }

  /**
   * Search operation.
   *
   * @method search
   * @param {string} base The base node where the search to start.
   * @param {int} scope The mod how the search will return the entrys.
   * @param {string} filter The specification for specific element.
   * @return {Promise} That resolve and return the entry of attribute.
   * Reject if an error will occure.
   */

  search(base, scope, filter) {
    return new Promise((resolve, reject) => {
      newClient.search(base, scope, filter, (err, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(err);
        }
      }, (progress) => {
        //console.log(progress);
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
