'use strict';

const binary = require('node-pre-gyp');
const path = require('path');
const Promise = require('bluebird');
const checkParameters = require('./utils/check_variable_format');
const SearchStream = require('./paged_search_stream.js');
const errorHandler = require('./errors/error_dispenser').errorFunction;
const StateError = require('./errors/state_error');
const errorMessages = require('./messages.json');
const errorCode = require('./error_codes.json');
const _ = require('underscore');
const ldif = require('ldif');

const bindingPath = binary.find(path.resolve(path.join(__dirname, '../package.json')));
const binding = require(bindingPath);

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

  /**
    * Constructor of LDAPAsyncWrap.
    *
    * @method constructor
    * @param {String} host The address host of the ldapServer
    * @param {Number} timeOut Optional value to change for all operation the time for a request
    * */
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
            reject(new CustomError(errorMessages.ldapInitializeErrorMessage));
          } else {
            this._stateClient = E_STATES.INITIALIZED;
            resolve();
          }
        });
      } else {
        reject(new StateError(errorMessages.initErrorMessage));
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
            reject(new CustomError(errorMessages.ldapStartTlsErrorMessage));
          } else {
            resolve();
          }
        });
      } else {
        reject(new StateError(errorMessages.initErrorMessage));
      }
    });
  }

  /**
    * Authenticate to LDAP server.
    *
    * @method bind
    * @param {String} bindDn The client user DN.
    * @param {String} passwordUser The client's password.
    * @param {Number} timeVal Optional parameter to set the time to wait for the operation
    * @return {Promise} That resolves if the credentials are correct.
    * Rejects if dn or password are incorrect or the client did not initialize.
    * */

  bind(bindDn, passwordUser, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === E_STATES.INITIALIZED) {
        const timeValue = timeVal === undefined ? this._timeVal : timeVal;
        this._binding.bind(bindDn, passwordUser, timeValue, (err, state) => {
          if (err) {
            const CustomError = errorHandler(err);
            this._stateClient = E_STATES.INITIALIZED;
            reject(new CustomError(errorMessages.ldapBindErrorMessage));
          } else {
            this._stateClient = E_STATES.BOUND;
            resolve();
          }
        });
      } else {
        reject(new StateError(errorMessages.uninitializedErrorMessage));
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
          if (err.constructor.code === errorCode.noSuchAttirbute) {
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
          if (err.constructor.code === errorCode.ldapNoSuchObject) {
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
     * @param {Number} timeVal Optional parameter to set the time to wait for the operation
     * @return {Promise} That resolves and returns a string with the search
     * results. Rejects in case of error.
     * */
  search(searchBase, scope, searchFilter, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorMessages.bindErrorMessage));
      } else {
        checkParameters.validateStrings(searchBase, scope);

        if (scopeObject[scope] === undefined) {
          throw new Error(errorMessages.scopeSearchErrorMessage);
        }
        const timeValue = timeVal === undefined ? this._timeVal : timeVal;

        const filter = _.isString(searchFilter) ? searchFilter : 'objectClass=*';

        this._binding.search(
          searchBase, scopeObject[scope], searchFilter, timeValue, (err, result) => {
            if (err) {
              const CustomError = errorHandler(err);
              reject(new CustomError(errorMessages.ldapSearchErrorMessage));
            } else {
              const resJSON = result.length === 0 ? result : ldif.parse(result);
              resolve(resJSON);
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
     * @param {String} searchFilter search filter. If not provided,
     * the default filter, objectClass=*, is used.
     * @param {int} pageSize The number of entries per LDAP page
     * @param {Number} timeVal Optional parameter to set the time to wait for the operation
     * @return {Promise} that resolves to a readable stream or rejects to a
     * Error;
     */
  pagedSearch(searchBase, scope, searchFilter, pageSize, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient === E_STATES.BOUND) {
        checkParameters.validateStrings(searchBase, searchFilter, scope);

        if (scopeObject[scope] === undefined) {
          throw new Error(errorMessages.scopeSearchErrorMessage);
        }

        if (!_.isNumber(pageSize)) {
          throw new TypeError(errorMessages.typeErrorMessage);
        }

        const filter = _.isString(searchFilter) ? searchFilter : 'objectClass=*';

        this._searchID += 1;
        const timeValue = timeVal === undefined ? this._timeVal : timeVal;
        resolve(new SearchStream(searchBase, scopeObject[scope], searchFilter, pageSize, this._searchID, this._binding, timeValue));
      }
      reject(new StateError(errorMessages.bindErrorMessage));
    });
  }


  /**
   * Compare operation.
   *
   * @method compare
   * @param {String} dn The dn of the entry to compare.
   * @param {String} attr The attribute given for comparison.
   * @param {String} value Value sent to compare.
   * @param {Number} timeVal Optional parameter to set the time to wait for the operation
   * @return {Promise} That resolves and returns True if the elements are
   * equal or False otherwise. Rejects if an error occurs.
   */

  compare(dn, attr, value, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorMessages.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn, attr, value);
        const timeValue = timeVal === undefined ? this._timeVal : timeVal;

        this._binding.compare(dn, attr, value, timeValue, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorMessages.ldapCompareErrorMessage));
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
    * @param {Number} timeVal Optional parameter to set the time to wait for the operation
    * @return {Promise} That resolves if LDAP modified successfully the
    * entry.
    * Reject if  LDAP rejects the operation or the client's state is not
    * BOUND
    */
  modify(dn, jsonChange, controls, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorMessages.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn);
        const changes = checkParameters.checkModifyChange(jsonChange);
        const ctrls = checkParameters.checkControl(controls);

        const timeValue = timeVal === undefined ? this._timeVal : timeVal;
        this._binding.modify(dn, changes, ctrls, timeValue, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorMessages.ldapModifyErrorMessage));
          } else {
            const resJSON = result === 0 ? result : ldif.parse(result);
            resolve(resJSON);
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
     * @param {Number} timeVal Optional parameter to set the time to wait for the operation
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
          reject(new CustomError(errorMessages.ldapExtendedOperationMessage));
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
   * or multiple controls. This parameter is optional.
   * @param {Number} timeVal Optional parameter to set the time to wait for the operation
   * @return {Promise} Will fulfil with a result from a control if the
   * operation is successful, else will reject with an LDAP error number.
   * */
  rename(dn, newRdn, newParent, controls, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorMessages.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn, newRdn, newParent);
        const ctrls = checkParameters.checkControl(controls);
        const timeValue = timeVal === undefined ? this._timeVal : timeVal;

        this._binding.rename(dn, newRdn, newParent, ctrls, timeValue, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorMessages.ldapRenameErrorMessage));
          } else {
            const resJSON = result === 0 ? result : ldif.parse(result);
            resolve(resJSON);
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
   * or multiple controls. This parameter is optional.
   * @param {Number} timeVal Optional parameter to set the time to wait for the operation
   * @return {Promise} promise that resolves if the element provided was
   * deleted
   * or rejects if not.
   * */
  delete(dn, controls, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorMessages.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn);
        const ctrls = checkParameters.checkControl(controls);
        const timeValue = timeVal === undefined ? this._timeVal : timeVal;

        this._binding.delete(dn, ctrls, timeValue, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorMessages.ldapDeleteErrorMessage));
          } else {
            const resJSON = result === 0 ? result : ldif.parse(result);
            resolve(resJSON);
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
    * @param {Number} timeVal Optional parameter to set the time to wait for the operation
    * @return {Promise} Will fulfil if the password was changed, fails otherwise. 
    * */
  changePassword(userDn, oldPassword, newPassword, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorMessages.bindErrorMessage));
      } else {
        checkParameters.validateStrings(userDn, oldPassword, newPassword);

        const timeValue = timeVal === undefined ? this._timeVal : timeVal;

        this._binding.changePassword(
          userDn, oldPassword, newPassword, timeValue, (err, result) => {
            if (err) {
              const CustomError = errorHandler(err);
              reject(new CustomError(errorMessages.ldapChangePasswordErrorMessage));
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
   * or multiple controls. This parameter is optional.
   * @param {Number} timeVal Optional parameter to set the time to wait for the operation
   * @return {Promise} that fulfils if the add was successful, rejects
   * otherwise.
   * */
  add(dn, entry, controls, timeVal) {
    return new Promise((resolve, reject) => {
      if (this._stateClient !== E_STATES.BOUND) {
        reject(new StateError(errorMessages.bindErrorMessage));
      } else {
        checkParameters.validateStrings(dn);
        const entryAttr = checkParameters.checkEntryObject(entry);
        const ctrls = checkParameters.checkControl(controls);
        const timeValue = timeVal === undefined ? this._timeVal : timeVal;

        this._binding.add(dn, entryAttr, ctrls, timeValue, (err, result) => {
          if (err) {
            const CustomError = errorHandler(err);
            reject(new CustomError(errorMessages.ldapAddErrorMessage));
          } else {
            const resJSON = result === 0 ? result : ldif.parse(result);
            resolve(resJSON);
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
            reject(new CustomError(errorMessages.ldapUnbindErrorMessage));
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
