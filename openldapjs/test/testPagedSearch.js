'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config');
const Promise = require('bluebird');
const errList = require('./errorlist.json');

describe.only('Testing the async LDAP search ', () => {

  const host = config.ldapAuthentication.host;
  const dnAdmin = config.ldapAuthentication.dnAdmin;
  const dnUser = config.ldapAuthentication.dnUser;
  const searchBase = config.ldapSearch.searchBase;


  const password = config.ldapAuthentication.passwordAdmin;
  let adminLDAP = new LDAPWrap(host);
  let userLDAP = new LDAPWrap(host);

  const pageSize = 10;

  const searchScope = {
    base: 'BASE',
    one: 'ONE',
    subtree: 'SUBTREE',
  };

  beforeEach(() => {
    adminLDAP = new LDAPWrap(host);
    userLDAP = new LDAPWrap(host);

    const init1 = adminLDAP.initialize();
    const init2 = userLDAP.initialize();

    return Promise.all([init1, init2])
      .then(() => {
        const bind1 = adminLDAP.bind(dnAdmin, password);
        const bind2 = userLDAP.bind(dnUser, password);

        return Promise.all([bind1, bind2]);
      });
  });

  afterEach(() => {
    const unbind1 = adminLDAP.unbind();
    const unbind2 = userLDAP.unbind();

    return Promise.all([unbind1, unbind2]);
  });

  it('should reject if the state of client is not BOUND', (next) => {
    adminLDAP.unbind()
      .then(() => {
        try {
          adminLDAP.pagedSearch(
            searchBase, searchScope.subtree,
            config.ldapSearch.filterObjSpecific, pageSize);
        } catch (err) {
          err.message.should.deepEqual(errList.bindErrorMessage);
          next();
        }
      });
  });

  it('should reject if searchBase is not string type', (next) => {
    try {
      adminLDAP.pagedSearch(
        1, searchScope.subtree, config.ldapSearch.filterObjSpecific,
        pageSize);
    } catch (err) {
      err.message.should.deepEqual(errList.typeErrorMessage);
      next();
    }
  });

  it('should reject if scope is not string type', (next) => {
    try {
      adminLDAP.pagedSearch(
        searchBase, 1, config.ldapSearch.filterObjSpecific, pageSize);
    } catch (err) {
      err.message.should.deepEqual(errList.typeErrorMessage);
      next();
    }
  });

  it('should reject if searchFilter is not string type', (next) => {
    try {
      adminLDAP.pagedSearch(searchBase, searchScope.subtree, 1, pageSize);
    } catch (err) {
      err.message.should.deepEqual(errList.typeErrorMessage);
      next();
    }
  });

  it('should reject if pageSize is not integer type', (next) => {
    try {
      adminLDAP.pagedSearch(
        searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific,
        '20');
    } catch (err) {
      err.message.should.deepEqual(errList.typeErrorIntMessage);
      next();
    }
  });

  it('should reject if scope parameter doesn\'t exist', (next) => {
    try {
      adminLDAP.pagedSearch(
        searchBase, 'noScope', config.ldapSearch.filterObjSpecific,
        pageSize);
    } catch (err) {
      err.message.should.deepEqual(errList.scopeSearchError);
      next();
    }
  });


});
