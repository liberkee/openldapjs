'use strict';

const Readable = require('stream').Readable;

/**
 * @class PagedSearchStream
 * class that extends the readable steram class
 */
module.exports = class PagedSearchStream extends Readable {

  /**
   *
   * @param {String} base the base for the search.
   * @param {unsigned int} scope scope for the search, can be 0(BASE), 1(ONE) or
   * 2(SUBTREE)
   * @param {String} filter search filter.
   * @param {unsigned int} pageSize number of results displayed per page.
   * @param {unsigned int} searchID unique search id.
   * @param {Object} ldapInstance the ldap instance the search belongs to.
   */
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

          this.push(null);
        } else if (!morePages) {
          this.push(page);
          console.log(
            'console log after the last page and before the push(null)');
          this.push(null);

        } else {
          this.push(page);
          // console.log('else:' + morePages);
        }
      });
  }

};
