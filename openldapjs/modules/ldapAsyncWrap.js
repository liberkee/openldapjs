'use strict';

const binding = require('../lib/bindings/build/Release/binding.node');
const Promise = require('bluebird');
const validator = require('./json_validator/json_validator');
const changeSchema = require('./schemas/change_schema');
const controlSchema = require('./schemas/control_schema');
const VerifyParameter = require('./checkVariableFormat/checkVariableFormat');

const bindErrorMessage =
    'The operation failed. It could be done if the state of the client is BOUND';

const checkParameters = new VerifyParameter();
/**
 * @module LDAPtranzition
 * @class LDAPAsyncWrap
 */
module.exports = class LDAPAsyncWrap {
  constructor(host, password) {
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
  set config(value) { this._hostAdress = value; }

  get config() { return this._hostAdress; }

  /**
    * Initialize to an LDAP server.
    *
    * @method initialize
    * @return {Promise} That resolves if the LDAP initialize succeeds
    * Rejects if the address is incorect or the client was not created.
    **/
  initialize() {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.CREATED) {
        this._binding.initialize(this._hostAdress, (err, result) => {
          if (result) {
            this._binding.startTls((errTls, stateTls) => {
              if (errTls) {
                reject(new Error(errTls));
              } else {
                this._stateClient = this._E_STATES.INITIALIZED;
                resolve(stateTls);
              }
            });
          }
        });
      } else {
        reject(new Error('Can initialize only if created'));
      }
    });
  }

  /**
    * Authentificate to LDAP server.
    *
    * @method bind
    * @param {string} username The client username
    * @param {string} password The client's password.
    * @return {Promise} That resolves if the credentials are correct.
    * Rejects if dn or password are incorect or the client did not initialize.
    **/

  bind(bindDN, passwordUser) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === this._E_STATES.INITIALIZED) {
        this._binding.bind(bindDN, passwordUser, (err, state) => {
          if (err || (state !== this._E_STATES.BOUND)) {
            this._stateClient = this._E_STATES.INITIALIZED;
            reject(new Error(err));
          } else {
            this._stateClient = state;
            resolve(this._stateClient);
          }
        });
      } else {
        reject(new Error('Can only bind if initialized'));
      }
    });
  }

  /**
     * Search operation.
     *
     * @method search
     * @param {string} searchBase the base for the search.
     * @param {int} scope scope for the search, can be 0(BASE), 1(ONE) or
     * 2(SUBTREE)
     * @param {string} searchFilter  search filter.
     * @return {Promise} That resolves and returns a string with the search
     *results. Rejects in case of error.
     **/
  search(searchBase, scope, searchFilter) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== this._E_STATES.BOUND) {
        reject(new Error(bindErrorMessage));
      } else {
        try {
          if (Number.isInteger(scope) !==
              true) {  // as of now we're checking both in js and in cpp..might
                       // consider dropping one.
            reject(new Error('Scope must be integer'));
          }
          checkParameters.checkParametersIfString([searchBase, searchFilter]);
          this._binding.search(
              searchBase, scope, searchFilter, (err, result) => {
                if (err) {
                  reject(new Error(err));
                } else {
                  resolve(result);
                }
              });
        } catch (error) {
          reject(new Error(error.message));
        }
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
   * @return {Promise} That resolves and returns True if the elements are equal
   * or
   * False otherwise.
   * Rejects if an error occurs.
   */

  compare(dn, attr, value) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== this._E_STATES.BOUND) {
        reject(new Error(bindErrorMessage));
      } else {
        try {
          checkParameters.checkParametersIfString([dn, attr, value]);

          this._binding.compare(dn, attr, value, (err, result) => {
            if (err) {
              reject(new Error(err));
            } else {
              resolve(result);
            }
          });
        } catch (error) {
          reject(new Error(error.message));
        }
      }
    });
  }

  /**
    * Perform an LDAP modify operation
    *
    * @method newModify
    * @param {string} dn The dn of the entry to modify
    * @param {array} jsonChange The attribute and value to be changed
    * @return {Promise} That resolves if LDAP modified successfully the entry.
    * Reject if  LDAP rejects the operation or the client's state is not
   * BOUND
    */
  modify(dn, jsonChange, controls) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== this._E_STATES.BOUND) {
        reject(new Error(bindErrorMessage));
      } else {
        try {
          checkParameters.checkModifyChangeArray(jsonChange);


          if (controls !== undefined) {
            checkParameters.checkControlArray(controls);
          }


          this._binding.newModify(
              dn, jsonChange, (controls !== undefined) ? controls : null,
              (err, result) => {
                if (err) {
                  reject(new Error(err));
                } else {
                  resolve(result);
                }
              });
        } catch (error) {
          reject(new Error(error.message));
        }
      }
    });
  }

  /**
      * Perform an LDAP rename  operation
      *
      * @method rename
      * @param {string} dn The dn of the entry to rename
      * @param {string} newrdn The new rdn for the dn
      * @param {string} newparent New parent for the rdn
      * @param {array} controls Control that is sent as a request to the server
      * @return {Promise} Will fulfil with a result from a control if the
      * operation is succesful, else will reject with an LDAP error number.
      */
  rename(dn, newrdn, newparent, controls) {
    return new Promise((resolve, reject) => {

      if (this._stateClient !== this._E_STATES.BOUND) {
        reject(new Error(bindErrorMessage));
      } else {
        try {
          checkParameters.checkParametersIfString([dn, newrdn, newparent]);

          if (controls !== undefined) {
            checkParameters.checkControlArray(controls);
          }
          this._binding.rename(
              dn, newrdn, newparent, (controls !== undefined) ? controls : null,
              (err, result) => {
                if (err) {
                  reject(new Error(err));
                } else {
                  resolve(result);
                }
              });
        } catch (error) {
          reject(new Error(error.message));
        }
      }
    });
  }

  /**
   * ldap delete operation
   * @param {String} dn the dn entry to be deleted.
   * @param {String array} controls Optional controll aray parameter, can be
   * NULL.
   * @return {Promise} promise that resolves if the element provided was deleted
   * or rejects if not.
   */
  del(dn, controls) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== this._E_STATES.BOUND) {
        reject(new Error(bindErrorMessage));
      } else {
        try {
          checkParameters.checkParametersIfString([dn]);

          if (controls !== undefined) {
            checkParameters.checkControlArray(controls);
          }
          this._binding.del(
              dn, (controls !== undefined) ? controls : null, (err, result) => {
                if (err) {
                  reject(new Error(err));
                } else {
                  resolve(result);
                }
              });
        } catch (error) {
          reject(new Error(error.message));
        }
      }
    });
  }
  /**
   * ldap add operation
   * @param {String} dn  dn of the entry to add Ex: 'cn=foo, o=example..,
   * NOTE:every entry except the first one,cn=foo in this case, must already
   * exist';
   * @param {Object} entry ldif format to be added, needs to have a
   * structure that is mappable to a LDAPMod structure
   * @param {Object} controls client& sever controls, OPTIONAL parameter
   * @return {Promise} that fulfils if the add was succesfull, rejects
   * otherwise.
   */
  add(dn, entry, controls) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== this._E_STATES.BOUND) {
        reject(new Error(bindErrorMessage));
      } else {
        try {
          checkParameters.checkParametersIfString([dn]);
          if (controls !== undefined) {
            checkParameters.checkControlArray(controls);
          }
          const keys = Object.keys(entry);
          const entryArray = [];

          for (const elem of keys) {
            entryArray.push(elem);
            entryArray.push(entry[elem]);
          }

          this._binding.add(
              dn, entryArray, (controls !== undefined) ? controls : null,
              (err, result) => {
                if (err) {
                  reject(new Error(err));
                } else {
                  resolve(result);
                }
              });
        } catch (error) {
          reject(new Error(error.message));
        }
      }
    });
  }

  /**
    * Unbind from a LDAP server.
    *
    * @method unbind
    * @return {Promise} That resolves if the LDAP structure was unbound.
    * Reject if the LDAP could not unbind.
    */
  unbind() {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== this._E_STATES.UNBOUND) {
        this._binding.unbind((err, state) => {
          if (state !== this._E_STATES.UNBOUND) {
            reject(new Error(err));
          } else {
            this._stateClient = state;
            resolve(this._stateClient);
          }
        });
      } else {
        resolve(this._stateClient);
      }
    });
  }
};
