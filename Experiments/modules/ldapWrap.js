'use strict';

/* Import the addon function and openLdap libraries */
const client = require('../addonFile/build/Release/binding');


module.exports = class LDAPWrap {

  constructor(host, dn, password) {
    this._hostAdress = host;
    this._bindDN = dn;
    this._userPassword = password;

    this._E_STATES = {
      CREATED: 0,
      INITIALIZED: 1,
      BOUND: 2,
      UNBOUND: 5,
    };

    this._myClient = new client.LDAPClient();
    this._stateClient = this._E_STATES.CREATED;
  }

  set config(value) {
    this._stateClient = value;
  }

  get config() {
    return this._stateClient;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.CREATED) {
        this._stateClient = this._myClient.initialize(this._hostAdress);

        if (this._stateClient !== this._E_STATES.INITIALIZED) {
          reject(new Error('The initialization failed'));
        } else {
          resolve(this._stateClient);
        }
      }
    });
  }

  bind() {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.INITIALIZED) {
        this._stateClient = this._myClient.bind(this._bindDN, this._userPassword);

        if (this._stateClient !== this._E_STATES.BOUND) {
          reject(new Error('The binding failed'));
        } else {
          resolve(this._stateClient);
        }
      } else {
        reject(new Error('The bind operation failed. It could be done if the state of the client is Initialized'));
      }
    });
  }

  unbind() {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.BOUND) {
        this._stateClient = this._myClient.unbind();

        if (this._stateClient !== this._E_STATES.UNBOUND) {
          reject(new Error('The unbinding failed'));
        } else {
          resolve(this._stateClient);
        }
      } else {
        reject(new Error('Binding shall be done before unbinding'));
      }
    });
  }

};
