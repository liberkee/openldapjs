import Promise = require('bluebird');
import { method } from 'bluebird';
import path = require('path');
import SearchStream = require('./stream_interface');
import errorHandler = require('./errors/error_dispenser');
import StateError = require('./errors/state_error');
import _ = require('underscore');

interface ObjectE_STATE {
  CREATED: number;
  INITIALIZED : number,
  BOUND : number,
  UNBOUND : number
  [key: string]: number
}

interface ObjectScopeObject {
  BASE: number;
  ONE : number,
  SUBTREE : number,
  [key: string]: number
}

/**
 * @module LDAPTransition
 * @class LDAPAsyncWrap
 */

declare class LDAPAsyncWrap {
   private _hostAddress:string;
   public _stateClient:number;
   public _searchID:number;
   constructor(host:string);

    /**
    * Initialize to an LDAP server.
    *
    * @method initialize
    * @return {Promise} That resolves if ldap_initialize succeeds
    ** Rejects if client was not created or ldap_initialize fails.
    * */

   initialize():Promise<any>;

  /**
    * Initiate a TLS processing on an LDAP session.
    *
    * @method startTLS
    * @param {String} pathToCertFile The path to the certificate can be optional
    * @return {Promise} Will reject if state is not Initialized or if the
    * certificate is not good else will resolve If the certificate is not
    * specified then the client will use the server certificate
    * */

    startTLS(pathToCertFile:string):Promise<any>;

    /**
    * Authenticate to LDAP server.
    *
    * @method bind
    * @param {String} bindDn The client user DN.
    * @param {String} passwordUser The client's password.
    * @return {Promise} That resolves if the credentials are correct.
    * Rejects if dn or password are incorrect or the client did not initialize.
    * */

  bind(bindDn:string, passwordUser:string):Promise<any>;

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
    search(searchBase:string, scope:string, searchFilter:string):Promise<any>;

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
  pagedSearch(searchBase:string, scope:string, searchFilter:string, pageSize:number):Promise<any>;


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

  compare(dn:string, attr:string, value:string):Promise<any>;

  /**
    * Perform an LDAP modify operation
    *
    * @method modify
    * @param {String} dn The dn of the entry to modify
    * @param {JSON} jsonChange The attribute and value to be changed
    * @param {JSON} [controls] Request to execute a specific control
   * or
    * multiple controls. This parameter is optional.
    * @return {Promise} That resolves if LDAP modified successfully the
    * entry.
    * Reject if  LDAP rejects the operation or the client's state is not
    * BOUND
    */
  modify(dn:string, jsonChange:JSON, controls:JSON):Promise<any>;

  /**
   * Perform an LDAP rename  operation
   *
   * @method rename
   * @param {String} dn The dn of the entry to rename
   * @param {String} newRdn The new rdn for the dn
   * @param {String} newParent New parent for the rdn
   * @param {JSON} [controls] Request to execute a specific control
   * or
   * multiple controls. This parameter is optional.
   * @return {Promise} Will fulfil with a result from a control if the
   * operation is successful, else will reject with an LDAP error number.
   * */
  rename(dn:string, newRdn:string, newParent:string, controls:JSON):Promise<any>;

  /**
   * Perform an LDAP delete operation
   *
   * @method delete
   * @param {String} dn the dn entry to be deleted.
   * @param {JSON} [controls] Request to execute a specific control
   * or
   * multiple controls. This parameter is optional.
   * @return {Promise} promise that resolves if the element provided was
   * deleted
   * or rejects if not.
   * */
  delete(dn:string, controls:JSON):Promise<any>;

  /**
    * Perform an LDAP password change operation
    *
    * @method changePassword
    * @param {String} userDN The user dn which the password will be changed
    * @param {String} oldPassword Old password of user
    * @param {String} newPassword New password for user
    * @return {Promise} Will fulfil with a result of success if the
    * Old password is given correctly, the parameters are string type and
    * the state of client is BOUND else will fail with type error or LDAP ERROR.
    * */
  changePassword(userDN:string, oldPassword:string, newPassword:string):Promise<any>;
  /**
   * Perform an LDAP add operation
   *
   * @method add
   * @param {String} dn  dn of the entry to add Ex: 'cn=foo, o=example..,
   * NOTE:every entry except the first one,cn=foo in this case, must already
   * exist'
   * @param {JSON} entry ldif format to be added, needs to have a
   * structure that is mappable to a LDAPMod structure
   * @param {JSON} [controls] Request to execute a specific control
   * or
   * multiple controls. This parameter is optional.
   * @return {Promise} that fulfils if the add was successful, rejects
   * otherwise.
   * */
  add(dn:string, entry:string, controls:JSON):Promise<any>;
  /**
    * Unbind from a LDAP server.
    *
    * @method unbind
    * @return {Promise} That resolves if the LDAP structure was unbound.
    * Reject if the LDAP could not unbind.
    */
  unbind():Promise<any>;

 }

export = LDAPAsyncWrap;
