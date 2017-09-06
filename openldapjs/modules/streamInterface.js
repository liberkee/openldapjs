'use strict'

const Readable = require('stream').Readable;
const binding = require('../lib/bindings/build/Release/binding.node');

 module.exports = class PagedSearchStream extends Readable {

    constructor(base,scope,filter,pageSize,searchID){
        super();
        this.objectMode = true;
        this._binding = new binding.LDAPClient();  
        this._base = base;
        this._scope = scope;
        this._filter = filter;
        this._pageSize = pageSize;
        this._searchID = searchID;      
    }

    _read(){
        this._binding.pagedSearch(this._base, this._scope, this._filter, this._pageSize, this._searchID, (err, page, morePages) => {
            if(!morePages){
                this.push(null);
            } else {
                this.push(page);
            }
        });
    }


}
