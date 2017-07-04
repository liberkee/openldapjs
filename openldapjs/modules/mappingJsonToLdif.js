'use strict';

/**
 * @module LDAPtranzition
 * @class MappingJsonToLdif
 */

const Promise = require('bluebird');

module.exports = class MappingJsonToLdif {

  constructor() {
    this._operations = {
      LDAP_MOD_ADD: 0,
      LDAP_MOD_DELETE: 1,
      LDAP_MOD_REPLACE: 2,
    };
  }


  /**
  * Start the preparing of the LDIF for modify operations
  *
  * @method modifyToLdif
  * @param {json} jsonToChange The JSON that contains all the required info to create the LDIF
  * @return {Promise} That resolves if the json has been parsed successfully the json.
  */
  modifyToLdif(jsonToChange) {
    return new Promise((resolve, reject) => {
      const ldif = [];
      let index = 0;


      if (jsonToChange !== null && this.checkJsonStructure(jsonToChange)) {
        jsonToChange.entries.forEach(function handleOperation(entry) {
          const operation = entry.operation;
          index += 1;

          if (operation === 'add') {
            this.addToLdif(entry.modification)
              .then((result) => {
                ldif.push(result);
              })
              .catch((err) => {
                reject(err);
              });
          } else if (operation === 'delete') {
            this.deleteToLdif(entry.modification)
              .then((result) => {
                ldif.push(result);
              })
              .catch((err) => {
                reject(err);
              });
          } else if (operation === 'replace') {
            this.replaceToLdif(entry.modification)
              .then((result) => {
                ldif.push(result);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject(new Error('The selected operation is invalid'));
          }

          if (index === jsonToChange.entries.length) {
            resolve(ldif);
          }

        }, this);

        if (ldif.length === 0) {
          reject(new Error('The passed JSON shall not be empty'));
        }
      } else {
        reject(new Error('The passed JSON shall not be null or the structure is not as required'));
      }
    });

  }

  /**
  * Creates a specific ldif for adding new entry to LDAP
  *
  * @method addToLdif
  * @param {json} jsonToChange The JSON that contains all the required info to create the LDIF
  * @return {Promise} That resolves if the json has been parsed successfully the json.
  */
  addToLdif(json) {
    return new Promise((resolve, reject) => {
      const ldif = [];

      ldif.push(this._operations.LDAP_MOD_ADD);
      ldif.push(json.type);

      const vals = json.vals;
      vals.push(0);
      ldif.push(vals);

      resolve(ldif);
    });
  }

  /**
  * Creates a specific ldif for deleting entries from LDAP
  *
  * @method deleteToLdif
  * @param {json} jsonToChange The JSON that contains all the required info to create the LDIF
  * @return {Promise} That resolves if the json has been parsed successfully the json.
  */
  deleteToLdif(json) {
    return new Promise((resolve, reject) => {
      const ldif = [];

      ldif.push(this._operations.LDAP_MOD_DELETE);
      ldif.push(json.type);
      ldif.push(0);

      resolve(ldif);
    });
  }

  /**
  * Creates a specific ldif for replacing entries from LDAP
  *
  * @method deleteToLdif
  * @param {json} jsonToChange The JSON that contains all the required info to create the LDIF
  * @return {Promise} That resolves if the json has been parsed successfully the json.
  */
  replaceToLdif(json) {
    return new Promise((resolve, reject) => {
      const ldif = [];

      ldif.push(this._operations.LDAP_MOD_REPLACE);
      ldif.push(json.type);

      const vals = json.vals;
      vals.push(0);
      ldif.push(vals);

      resolve(ldif);
    });
  }


  checkJsonStructure(json) {
    let hasEntry = false;
    let hasOperation = true;
    let hasModification = true;
    let hasType = true;
    if (json.hasOwnProperty('entries')) {
      hasEntry = true;
    }

    if (hasEntry) {
      json.entries.forEach(function loopJson(entry) {
        if (!entry.hasOwnProperty('operation')) {
          hasOperation = false;
        }
        if (!entry.hasOwnProperty('modification')) {
          hasModification = false;
        }

        if (!entry.modification.hasOwnProperty('type')) {
          hasType = false;
        }

      }, this);
    }

    const result = hasEntry && hasOperation && hasModification && hasType;
    return result;
  }

};
