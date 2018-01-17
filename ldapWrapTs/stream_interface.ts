import { Readable as Readable } from 'stream';
import { RootObject } from './messages';
import * as errorHandler from './errors/error_dispenser';

const errorMessages: RootObject = require('./messages.json');
const ldif: any = require('ldif');

/**
 * @class PagedSearchStream
 * class that extends the readable stream class
 */
export default class PagedSearchStream extends Readable {

  /**
   *
   * @param {String} base the base for the search.
   * @param {unsigned int} scope scope for the search, can be 0(BASE), 1(ONE) or
   * 2(SUBTREE)
   * @param {String} filter search filter.
   * @param {unsigned int} pageSize number of results displayed per page.
   * @param {unsigned int} searchId unique search id.
   * @param {Object} ldapInstance the ldap instance the search belongs to.
   */

  objectMode: boolean;
  _binding: any;
  _base: string;
  _scope: number;
  _filter: string;
  _pageSize: number;
  _searchId: number;
  _lastResult: boolean;
  constructor(base: string, scope: number, filter: string, pageSize: number,
              searchId: number, ldapInstance: any) {
    super();
    this.objectMode = true;
    this._binding = ldapInstance;
    this._base = base;
    this._scope = scope;
    this._filter = filter;
    this._pageSize = pageSize;
    this._searchId = searchId;
    this._lastResult = false;
  }

  _read(): void {
    if (this._lastResult) {
      this.push(null);
    } else {
      this._binding.pagedSearch(
        this._base, this._scope, this._filter, this._pageSize, this._searchId,
        (err: number, page: string, morePages: boolean) => {
          if (err) {
            const customError: any = errorHandler.errorSelection(err);
            this.emit('err', new customError(errorMessages.ldapSearchErrorMessage));
            this.push(null);
          } else {
            if (!morePages) this._lastResult = true;
            const resJSON: string = JSON.stringify(ldif.parse(page));
            this.push(resJSON);
          }

        });
    }
  }

}
