'use strict';

/* Import the addon function and openLdap libraries */
const client = require('./addonFile/build/Release/binding');

class LDAPWrap {

  constructor(host, dn, password) {
    this._hostAdress = host;
    this._bindDN = dn;
    this._userPassword = password;
    this._clientState = '';

    this._E_STATES = {
      CREATED: 0,
      INITIALIZED: 1,
      BOUND: 2,
      UNBOUND: 5,
    };

    this._myClient = new client.LDAPClient();
    this._stateClient = this._E_STATES.CREATED;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      if (this._clientState === this._E_STATES.CREATED) {
        this._stateClient = this._myClient.initialize(this._hostAdress);

        if (this._stateClient !== this._E_STATES.INITIALIZED) {
          reject(new Error('The initialization failed'));
        } else {
          resolve(this._clientState);
        }
      }
    });
  }

  bind() {
    return new Promise((resolve, reject) => {
      if (this._clientState === this._E_STATES.INITIALIZED) {
        this._stateClient = this._myClient.bind(this._bindDN, this._userPassword);

        if (this._stateClient !== this._E_STATES.BOUND) {
          reject(new Error('The binding failed'));
        } else {
          resolve(this._clientState);
        }
      }
    });
  }

  unbind() {
    return new Promise((resolve, reject) => {
      if (this._clientState === this._E_STATES.BOUND) {
        this._stateClient = this._myClient.unbind();

        if (this._stateClient !== this._E_STATES.UNBOUND) {
          reject(new Error('The unbinding failed'));
        } else {
          resolve(this._clientState);
        }
      }
    });
  }

}
