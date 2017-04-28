'use strict';

const binding = require('../lib/bindings/build/Release/binding.node');
const Promise = require('bluebird');

/**
 * @module LDAPtranzition
 * @class LDAPWrapAsync
 */

module.exports = class LDAPWrapAsync {

  constructor(host, dn, password) {
    this._hostAdress = host;
    this._E_STATES = {
      CREATED: 0,
      INITIALIZED: 1,
      BOUND: 2,
      UNBOUND: 5,
    };
    this._binding = new binding.LDAPClient();
    this._stateClient = this._E_STATES.CREATED;
  }

  set config(value) {
    this._hostAdress = value;
  }

  get config() {
    return this._hostAdress;
  }

  /**
    * Initialize to an LDAP server.
    *
    * @method initialize
    * @return {Promise} That resolves if the LDAP initialize the structure to a specific server.
    * Reject if the address is incorect.
    */

  initialize() {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.CREATED) {
        this._binding.initialize(this._hostAdress, (err, state) => {
          if (state !== this._E_STATES.INITIALIZED) {
            reject(new Error(err));
          } else {
            this._stateClient = state;
            resolve(this._stateClient);
          }
        });
      }
    });
  }

  /**
   * Authentificate to LDAP server.
   *
   * @method bind
   * @param {string} bindDN The username of specific client.
   * @param {string} passwordUser The password for authentification.
   * @return {Promise} That resolves if the credentials are correct.
   * Reject dn or password are incorect.
   */

  bind(bindDN, passwordUser) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.INITIALIZED) {
        this._binding.bind(bindDN, passwordUser, (err, state) => {
          if (state !== this._E_STATES.BOUND) {
            reject(new Error(err));
          } else {
            this._stateClient = state;
            resolve(this._stateClient);
          }
        });
      } else {
        reject(new Error('The bind operation failed. It could be done if the state of the client is Initialized'));
      }
    });
  }

  /**
   * Search operation.
   *
   * @method search
   * @param {string} searchBase The base node where the search to start.
   * @param {int} scope The mod how the search will return the entrys.
   * @param {string} searchFilter The specification for specific element.
   * @return {Promise} That resolve and return the a string with search result.
   * Reject if an error will occure.
   */

  search(searchBase, scope, searchFilter) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.BOUND) {
        this._binding.search(searchBase, scope, searchFilter, (err, state) => {
          if (err) {
            reject(new Error(err));
          } else {
            this._stateClient = state;
            resolve(this._stateClient);
          }
        });
      } else {
        reject(new Error('Wrong state'));

      }

    });
  }

  /**
   * Compare operation.
   *
   * @method search
   * @param {string} dn The dn of the entry to compare.
   * @param {string} attr The attribute given for interogation.
   * @param {string} value Value send to verify.
   * @return {Promise} That resolve and return True if the element are equal or False otherwise.
   * Reject if an error will occure.
   */

  compare(dn, attr, value) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.BOUND) {
        binding.compare(dn, attr, value, (err, state) => {
          if (err) {
            reject(new Error(err));
          } else {
            this._stateClient = state;
            resolve(this._stateClient);
          }
        });
      }
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
      if (this._stateClient === this._E_STATES.BOUND) {
        this._binding.unbind((err, state) => {
          if (state !== this._E_STATES.UNBOUND) {
            reject(new Error(err));
          } else {
            this._stateClient = state;
            resolve(this._stateClient);
          }
        });
      } else {
        reject(new Error('Binding shall be done before unbinding'));
      }
    });
  }

};

