'use strict';

const should = require('should');
const LDAPWrap = require('../libs/ldap_async_wrap.js');
const config = require('./config.json');
const errorList = require('./error_list.json');
const errorHandler = require('../libs/errors/error_dispenser').errorFunction;
const StateError = require('../libs/errors/state_error');

describe('Testing the async LDAP search ', () => {

  const host = config.ldapAuthentication.host;
  const dnAdmin = config.ldapAuthentication.dnAdmin;
  const dnUser = config.ldapAuthentication.dnUser;
  const searchBase = config.ldapSearch.searchBase;

  const password = config.ldapAuthentication.passwordAdmin;
  let adminLDAP = new LDAPWrap(host);
  let userLDAP = new LDAPWrap(host);
  const pathToCert = config.ldapAuthentication.pathFileToCert;

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
    const startTLS1 = adminLDAP.startTLS(pathToCert);
    const startTLS2 = userLDAP.startTLS(pathToCert);

    return Promise.all([init1, init2, startTLS1, startTLS2])
      .then(() => {
        const bind1 = adminLDAP.bind(dnAdmin, password);
        const bind2 = userLDAP.bind(dnUser, password);

        return Promise.all([bind1, bind2]);
      });

  });

  afterEach(() => {
    return adminLDAP.unbind()
      .then(() => { return userLDAP.unbind(); });
  });

  it('should reject if the state is not BOUND', () => {
    return adminLDAP.unbind()
      .then(() => {
        return adminLDAP.search(
          searchBase, searchScope.subtree,
          config.ldapSearch.filterObjSpecific);
      })
      .then(() => { should.fail('should not have passed'); })
      .catch(
        StateError,
        (error) => {
          should.deepEqual(error.message, errorList.bindErrorMessage);
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should return an empty search', () => {
    return adminLDAP
      .search(
        searchBase, searchScope.subtree,
        config.ldapSearch.filterObjSpecific)
      .then((result) => { result.should.be.empty; });
  });
  /**
   * case for search with non existing search base
   */
  it('should return the root node', () => {
    const ROOT_NODE =
        '\ndn: \nobjectClass: top\nobjectClass: OpenLDAProotDSE\n';
    return adminLDAP
      .search('', searchScope.base, config.ldapSearch.filterObjAll)
      .then((result) => { should.deepEqual(result, ROOT_NODE); });
  });
  /**
   * test case for search with access denied
   */

  it('should return an LDAP_OBJECT_NOT_FOUND error', () => {
    const CustomError = errorHandler(errorList.ldapNoSuchObject);
    return userLDAP
      .search(searchBase, searchScope.subtree, config.ldapSearch.filterObjAll)
      .then(() => { should.fail('should not have passed'); })
      .catch(
        CustomError,
        (err) => {
          err.should.be.deepEqual(
            new CustomError(errorList.ldapSearchErrorMessage));
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should reject if the scope is not a string', () => {
    return userLDAP.search(searchBase, 2, config.ldapSearch.filterObjAll)
      .then(() => { should.fail('should not have passed'); })
      .catch(
        TypeError,
        (err) => {
          err.message.should.be.deepEqual(errorList.typeErrorMessage);
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });

  it('should reject if the scope doesn\'t exist', () => {
    return userLDAP
      .search(searchBase, 'notGoodScope', config.ldapSearch.filterObjAll)
      .then(() => { should.fail('Didn\'t expect success'); })
      .catch((err) => {
        err.message.should.be.deepEqual(errorList.scopeSearchErrorMessage);
      });
  });

  it('should reject if the searchBase is not a string', () => {
    return userLDAP
      .search(1, searchScope.subtree, config.ldapSearch.filterObjAll)
      .then(() => { should.fail('should not have passed'); })
      .catch(
        TypeError,
        (err) => {
          err.message.should.be.deepEqual(errorList.typeErrorMessage);
        })
      .catch((err) => { should.fail('did not expect generic error'); });
  });


  /**
   * test case with a single result
   */

  it('should return a single result', () => {
    return adminLDAP
      .search(
        searchBase, searchScope.subtree,
        config.ldapSearch.filterObjSpecific2)
      .then((result) => {
        const count = (result.match(/\ndn:/g) || []).length;
        count.should.be.eql(1);
      });
  });

  /* *
   * test case with multiple results on the same level( scope argument 1?)
   *
   * */
  it('should return multiple results located on the same level', () => {
    return adminLDAP
      .search(searchBase, searchScope.one, config.ldapSearch.filterObjAll)
      .then((result) => {
        const count = (result.match(/\ndn:/g) || []).length;
        count.should.be.above(1);
      });
  });

  /**
   * test case with sequential identical searches
   */

  it('should return the same result', () => {

    const search1 = adminLDAP.search(
      searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific2);
    const search2 = adminLDAP.search(
      searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific2);

    return Promise.all([search1, search2])
      .then((results) => {
        should.notDeepEqual(results[0], results[1]);
      });

  });

  /**
   * case with sequential different searches(including error cases)
   */
  it('should return sequential different results and errors', () => {
    let result1;
    let result2;
    let result3;

    return adminLDAP
      .search(
        searchBase, searchScope.subtree,
        config.ldapSearch.filterObjSpecific2)
      .then((res1) => {
        result1 = res1;
        return adminLDAP.search(
          searchBase, searchScope.subtree,
          config.ldapSearch.filterObjSpecific);
      })
      .then((res2) => {
        result2 = res2;
        should.notDeepEqual(result1, result2);
        return adminLDAP.search(
          searchBase, 1, config.ldapSearch.filterObjAll);
      })
      .then((res3) => {
        result3 = res3;
        should.notDeepEqual(result1, result3);
        should.notDeepEqual(result2, result3);
        return adminLDAP.search(
          'dc=wrongBase,dc=err', searchScope.subtree, 'objectClass=errors');
      })
      .then(() => { should.fail('should not have passed'); })
      .catch((err) => { err.should.not.be.empty; });
  });


  /**
   * test cases for parallel searches
   */

  it('should return search results done in parallel', () => {
    const firstResult = adminLDAP.search(
      searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific2);
    const secondResult = adminLDAP.search(
      searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific2);
    const thirdResult = adminLDAP.search(
      searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific);

    return Promise.all([firstResult, secondResult, thirdResult])
      .then((values) => {
        should.deepEqual(values[0], values[1]);
        should.notDeepEqual(values[0], values[2]);
        should.notDeepEqual(values[1], values[2]);
      });
  });

  it('should return results in entire subtree', () => {
    return adminLDAP
      .search(
        searchBase, searchScope.subtree,
        config.ldapSearch.filterObjSpecific3)
      .then((result) => {
        const count = (result.match(/\ndn:/g) || []).length;
        count.should.be.above(1);
      });
  });

  /**
   * Test case with a large number of results (>10k)
   */
  it('should return >10k entries', function searchTime() {
    this.timeout(0);
    return adminLDAP
      .search(searchBase, searchScope.subtree, config.ldapSearch.filterObjAll)
      .then((result) => {
        const count = (result.match(/\ndn:/g) || []).length;
        count.should.be.above(10000);
      });
  });
});
