import {Readable as Readable} from "stream";

/**
 * @class PagedSearchStream
 * class that extends the readable stream class
 */
declare class PagedSearchStream extends Readable {
  
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

    objectMode:boolean;
    _binding:any;
    _base:string;
    _scope:number;
    _filter:string;
    _pageSize:number;
    _searchId: number;
    _lastResult: boolean;
    constructor(base:string, scope:number, filter:string, pageSize:number, searchId:number, ldapInstance:any);
  
    _read():void;

  }
export = PagedSearchStream;