'use strict';

/**
 * @module LDAPtranzition
 * @class MappingJsonToLdif
 */
module.exports = class MappingJsonToLdif {

    constructor() {
        this._operations = {
            LDAP_MOD_ADD: 0,
            LDAP_MOD_DELETE: 1,
            LDAP_MOD_REPLACE: 2
        };
    }


    /**
    * Start the preparing of the LDIF for modify operations
    *
    * @method changeToLdif
    * @param {json} jsonToChange The JSON that contains all the required info to create the LDIF
    * @return {Promise} That resolves if the json has been parsed successfully the json.
    */
    changeToLdif(jsonToChange) {
        return new Promise((resolve, reject) => {
            const operation = jsonToChange.operation;

            if (operation === 'add') {
                this.addToLdif(jsonToChange)
                    .then((res) => {
                        resolve(res);
                    })
            } else if (operation === 'delete') {
                this.deleteToLdif(jsonToChange)
                    .then((res) => {
                        resolve(res);
                    })
            } else if (operation === 'replace') {
                this.replaceToLdif(jsonToChange)
                    .then((res) => {
                        resolve(res);
                    })
            } else {
                this.addToLdif(jsonToChange)
                    .then((res) => {
                        resolve(res);
                    })
                reject(new Error('Invalid Operation'));
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
            let ldif = [];

            json.forEach(function(element) {
                console.log(element);
            }, this);

            ldif.push(this._operations.LDAP_MOD_ADD);
            ldif.push(json.modification['type']);

            const vals = json.modification['vals'];
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
            let ldif = [];

            ldif.push(this._operations.LDAP_MOD_DELETE);
            ldif.push(json.modification['type']);
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
            let ldif = [];

            ldif.push(this._operations.LDAP_MOD_REPLACE);
            ldif.push(json.modification['type']);

            const vals = json.modification['vals'];
            vals.push(0);
            ldif.push(vals);

            resolve(ldif);
        });
    }
}

