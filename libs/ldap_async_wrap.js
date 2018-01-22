'use strict';

const binding = require('../build/Release/binding.node');
const Promise = require('bluebird');
const checkParameters = require('./utils/check_variable_format');
const SearchStream = require('./stream_interface.js');
const errorHandler = require('./errors/error_dispenser').errorFunction;
const StateError = require('./errors/state_error');
const errorList = require('../test/error_list.json');
const _ = require('underscore');


const E_STATES = {
  CREATED: 0,
  INITIALIZED: 1,
  BOUND: 2,
  UNBOUND: 5,
};

const scopeObject = {
  BASE: 0,
  ONE: 1,
  SUBTREE: 2,
};

const LDAP_COMPARE_TRUE = 6;

const TIME_OUT_DEFAULT_VAL = 10;

/**
 * @module LDAPTransition
 * @class LDAPAsyncWrap
 */
class LDAPAsyncWrap {

  constructor(host, timeOut) {
    this._timeVal = timeOut === undefined ? TIME_OUT_DEFAULT_VAL : timeOut;
    this._hostAddress = host;
    this._binding = new binding.LDAPClient();
    this._stateClient = E_STATES.CREATED;
  }

  /**
    * Initialize to an LDAP server.
    *
    * @method initialize
    * @return {Promise} That resolves if ldap_initialize succeeds
    ** Rejects if client was not created or ldap_initialize fails.
    * */
  initialize() {
    return new Promise((resolve, reject) => {
      if (this._stateClient === E_STATES.CREATED) {
        this._binding.initialize(this._hostAddress, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapInitializeErrorMessage));
          } else {
            this._stateClient = E_STATES.INITIALIZED;
            resolve();
          }
        });
      } else {
        reject(new StateError(errorList.initErrorMessage));
      }
    });
  }

  /**
    * Initiate a TLS processing on an LDAP session.
    *
    * @method startTLS
    * @param {String} pathToCertFile The path to the certificate can be optional
    * @return {Promise} Will reject if state is not Initialized or if the
    * certificate is not good else will resolve If the certificate is not
    * specified then the client will use the server certificate
    * */

  startTLS(pathToCertFile) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === E_STATES.INITIALIZED) {
        const path = pathToCertFile === undefined ? '' : pathToCertFile;
        this._binding.startTls(path, (err, res) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapStartTlsErrorMessage));
          } else {
            resolve();
          }
        });
      } else {
        reject(new StateError(errorList.initErrorMessage));
      }
    });
  }

  /**
    * Authenticate to LDAP server.
    *
    * @method bind
    * @param {String} bindDn The client user DN.
    * @param {String} passwordUser The client's password.
    * @return {Promise} That resolves if the credentials are correct.
    * Rejects if dn or password are incorrect or the client did not initialize.
    * */

  bind(bindDn, passwordUser) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === E_STATES.INITIALIZED) {
        this._binding.bind(bindDn, passwordUser, (err, state) => {
          if (err) {
            const CustomError = errorHandler(err);
            this._stateClient = E_STATES.INITIALIZED;
            reject(new CustomError(errorList.ldapBindErrorMessage));
          } else {
            this._stateClient = E_STATES.BOUND;
            resolve();
          }
        });
      } else {
        reject(new StateError(errorList.uninitializedErrorMessage));
      }
    });
  }

  /**
     * attributeExists operation.
     *
     * @method attributeExists
     * @param {String} dn the entry for verification.
     * @param {String} attributeName attribute that is required.
     * @return {Promise} Will resolve with false in case of noSuchAttribute 
     * error and true otherwise and reject if there is an error
     * */

  attributeExists(dn, attributeName) {
    return new Promise((resolve, reject) => {
      this.compare(dn, attributeName, '1@a-value')
        .then((res) => {
          resolve(true);
        })
        .catch((err) => {
          if (err.constructor.code === errorList.noSuchAttirbute) {
            resolve(false);
          } else {
            reject(err);
          }
        });
    });
  }

  /**
     * objectExists operation.
     *
     * @method objectExists
     * @param {String} dn the entry for verification.
     * @return {Promise} Will resolve with false in case of noSuchObject 
     * error and the result of compare otherwise and reject if there is an error
     * */

  objectExists(dn) {
    return new Promise((resolve, reject) => {
      let dnRes = dn.split(',');
      dnRes = dnRes[0].split('=');
      const attribute = dnRes[0];
      const value = dnRes[1];
      this.compare(dn, attribute, value)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          if (err.constructor.code === errorList.ldapNoSuchObject) {
            resolve(false);
          } else {
            reject(err);
          }
        });
    });
  }


  /**
     * Search operation.
     *
     * @method search
     * @param {String} searchBase the base for the search.
     * @param {String} scope  scope for the search, can be BASE, ONE or
     * SUBTREE
     * @param {String} searchFilter  search filter.If not provided,
     * the default filter, (objectClass=*), is used.
     * @return {Promise} That resolves and returns a string with the search
     * results. Rejects in case of error.
     * */
  search(searchBase, scope, searchFilter) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorList.bindErrorMessage));
      } else {
        checkParameters.validateStrings(searchBase, searchFilter, scope);

        if (scopeObject[scope] === undefined) {
          throw new Error(errorList.scopeSearchErrorMessage);
        }

        this._binding.search(
          searchBase, scopeObject[scope], searchFilter, (err, result) => {
            if (err) {
              const CustomError = errorHandler(err);
              reject(new CustomError(errorList.ldapSearchErrorMessage));
            } else {
              resolve(result);
            }
          });
      }
    });
  }


  /**
     * Search operation with results displayed page by page.
     *
     * @method pagedSearch
     * @param {String} searchBase the base for the search.
     * @param {String} scope  scope for the search, can be BASE, ONE or
     * SUBTREE
     * @param {String} searchFilter search filter.
     * @param {int} pageSize The number of entries per LDAP page
     * @return {Promise} that resolves to a readable stream or rejects to a
     * Error;
     */
  pagedSearch(searchBase, scope, searchFilter, pageSize) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === E_STATES.BOUND) {
        checkParameters.validateStrings(searchBase, searchFilter, scope);

        if (scopeObject[scope] === undefined) {
          throw new Error(errorList.scopeSearchErrorMessage);
        }

        if (!_.isNumber(pageSize)) {
          throw new TypeError(errorList.typeErrorMessage);
        }
        this._searchID += 1;
        resolve(
          new SearchStream(
            searchBase, scopeObject[scope], searchFilter, pageSize,
            this._searchID, this._binding));
      }
      reject(new StateError(errorList.bindErrorMessage));
    });
  }


  /**
   * Compare operation.
   *
   * @method compare
   * @param {String} dn The dn of the entry to compare.
   * @param {String} attr The attribute given for comparison.
   * @param {String} value Value sent to compare.
   * @return {Promise} That resolves and returns True if the elements are
   * equal
   * or
   * False otherwise.
   * Rejects if an error occurs.
   */

  compare(dn, attr, value) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorList.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn, attr, value);

        this._binding.compare(dn, attr, value, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapCompareErrorMessage));
          } else {
            const res = result === LDAP_COMPARE_TRUE;
            resolve(res);
          }
        });
      }
    });
  }

  /**
    * Perform an LDAP modify operation
    *
    * @method modify
    * @param {String} dn The dn of the entry to modify
    * @param {Object || Array} jsonChange The attribute and value to be changed
    * @param {Object || Array} [controls] Request to execute a specific control
    * or multiple controls. This parameter is optional.
    * @return {Promise} That resolves if LDAP modified successfully the
    * entry.
    * Reject if  LDAP rejects the operation or the client's state is not
    * BOUND
    */
  modify(dn, jsonChange, controls) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorList.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn);
        const changes = checkParameters.checkModifyChange(jsonChange);
        const ctrls = checkParameters.checkControl(controls);

        this._binding.modify(dn, changes, ctrls, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapModifyErrorMessage));
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  /**
     * Extended operation for operation using there OID and value.
     *
     * @method extendedOperation
     * @param {String} oid the operation specific OID.
     * @param {String | Number | String[] | Number[]} values the values that 
     * are required for the operation.
     * @param {Number} lastArgument Optional parameter to set the time to wait for the operation
     * @return {Promise} Will resolve with the response from the server 
     * and reject in case of error
     */

  extendedOperation(oid, values, timeVal) {
    return new Promise((resolve, reject) => {
      const objectValue = {};
      if (values !== undefined) {
        _.each(Array.isArray(values) ? values : [values], (element, index) => {
          objectValue[index] = element;
        });
      }

      const valueData = _.isEmpty(objectValue) ? null : objectValue;
      const timeValue = timeVal === undefined ? this._timeVal : timeVal;
      this._binding.extendedOperation(oid, valueData, timeValue, (err, result) => {
        if (err) {
          const CustomError = errorHandler(err);
          reject(new CustomError(errorList.ldapExtendedOperationMessage));
        } else {
          resolve(result);
        }
      });
    });
  }


  /**
   * Perform an LDAP rename  operation
   *
   * @method rename
   * @param {String} dn The dn of the entry to rename
   * @param {String} newRdn The new rdn for the dn
   * @param {String} newParent New parent for the rdn
   * @param {Object || Array} [controls] Request to execute a specific control
   * or
   * multiple controls. This parameter is optional.
   * @return {Promise} Will fulfil with a result from a control if the
   * operation is successful, else will reject with an LDAP error number.
   * */
  rename(dn, newRdn, newParent, controls) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorList.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn, newRdn, newParent);
        const ctrls = checkParameters.checkControl(controls);

        this._binding.rename(dn, newRdn, newParent, ctrls, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapRenameErrorMessage));
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  /**
   * Perform an LDAP delete operation
   *
   * @method delete
   * @param {String} dn the dn entry to be deleted.
   * @param {Object || Array} [controls] Request to execute a specific control
   * or
   * multiple controls. This parameter is optional.
   * @return {Promise} promise that resolves if the element provided was
   * deleted
   * or rejects if not.
   * */
  delete(dn, controls) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorList.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn);
        const ctrls = checkParameters.checkControl(controls);

        this._binding.delete(dn, ctrls, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapDeleteErrorMessage));
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  /**
    * Perform an LDAP password change operation
    *
    * @method changePassword
    * @param {String} userDn The user dn whose password will be changed
    * @param {String} oldPassword Old password of userDn
    * @param {String} newPassword New password for userDn
    * @return {Promise} Will fulfil if the password was changed, fails otherwise. 
    * */
  changePassword(userDn, oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorList.bindErrorMessage));
      } else {
        checkParameters.validateStrings(userDn, oldPassword, newPassword);

        this._binding.changePassword(
          userDn, oldPassword, newPassword, (err, result) => {
            if (err) {
              const CustomError = errorHandler(err);
              reject(
                new CustomError(errorList.ldapChangePasswordErrorMessage));
            } else {
              resolve();
            }
          });
      }
    });
  }
  /**
   * Perform an LDAP add operation
   *
   * @method add
   * @param {String} dn  dn of the entry to add Ex: 'cn=foo, o=example..,
   * NOTE:every entry except the first one,cn=foo in this case, must already
   * exist'
   * @param {Object || Array} entry ldif format to be added, needs to have a
   * structure that is mappable to a LDAPMod structure
   * @param {Object || Array} [controls] Request to execute a specific control
   * or
   * multiple controls. This parameter is optional.
   * @return {Promise} that fulfils if the add was successful, rejects
   * otherwise.
   * */
  add(dn, entry, controls) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorList.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn);
        const entryAttr = checkParameters.checkEntryObject(entry);
        const ctrls = checkParameters.checkControl(controls);

        this._binding.add(dn, entryAttr, ctrls, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapAddErrorMessage));
          } else {
            resolve(result);
          }
        });
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
      if (this._stateClient !== E_STATES.UNBOUND) {
        this._binding.unbind((err, state) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorList.ldapUnbindErrorMessage));
          } else {
            this._stateClient = E_STATES.UNBOUND;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

}


module.exports = LDAPAsyncWrap;
