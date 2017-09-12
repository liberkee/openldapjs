'use strict'

    const Readable = require('stream').Readable;

module.exports = class PagedSearchStream extends Readable {
  constructor(base, scope, filter, pageSize, searchID, ldapInstance) {
    super();
    this.objectMode = true;
    this._binding = ldapInstance;
    this._base = base;
    this._scope = scope;
    this._filter = filter;
    this._pageSize = pageSize;
    this._searchID = searchID;
  }

  _read() {
    this._binding.pagedSearch(
        this._base, this._scope, this._filter, this._pageSize, this._searchID,
        (err, page, morePages) => {
          if (err) {
            this.emit('err', err);
          } else {
            if (!morePages) {
              this.push(null);
            } else {
              // setTimeout( () => {
              this.push(page);
              //    },1000)
            }
          }
        });
  }
}
