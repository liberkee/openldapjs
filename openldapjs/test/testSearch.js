'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const jsonMap = require('../modules/mappingJsonObject/mappingStringJson.js');
const config = require('./config.json');

const OBJECT_NOT_FOUND = '32';
const ROOT_NODE = '\ndn:\nobjectClass:top\nobjectClass:OpenLDAProotDSE\n\n';
const resStateRequired =
    'The operation failed. It could be done if the state of the client is BOUND';
const scopeError = 'Scope must be integer';
const searchBseError = 'The 1 is not string';

describe('Testing the async LDAP search ', () => {


  const host = config.ldapAuthentification.host;
  const dnAdmin = config.ldapAuthentification.dnAdmin;
  const dnUser = config.ldapAuthentification.dnUser;
  const searchBase = config.ldapSearch.searchBase;

  const password = config.ldapAuthentification.passwordAdmin;
  let adminLDAP = new LDAPWrap(host);
  let userLDAP = new LDAPWrap(host);

  beforeEach((next) => {
    adminLDAP = new LDAPWrap(host);
    userLDAP = new LDAPWrap(host);

    adminLDAP.initialize().then(() => {
      adminLDAP.bind(dnAdmin, password).then(() => {
        userLDAP.initialize().then(
            () => { userLDAP.bind(dnUser, password).then(() => { next(); }); });
      });
    });
  });

  afterEach(() => {
    adminLDAP.unbind();
    userLDAP.unbind();

  });

  it('should reject if the state is not BOUND', (next) => {
    adminLDAP.unbind().then(() => {
      adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific)
          .catch((error) => {
            should.deepEqual(error.message, resStateRequired);
            next();
          });
    });
  });

  it('should return an empty search', (next) => {
    adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific)
        .then((result) => { result.should.be.empty; })
        .then(() => { next(); });
  });
  /**
   * case for search with non existing search base
   */
  it('should return the root node', (next) => {
    adminLDAP.search('', 0, config.ldapSearch.filterObjAll)
        .then((result) => { should.deepEqual(result, ROOT_NODE); })
        .then(() => { next(); });

  });
  /**
   * test case for search with access denied
   */

  it('should return an LDAP_OBJECT_NOT_FOUND error', (next) => {
    userLDAP.search(searchBase, 2, config.ldapSearch.filterObjAll)
        .catch((err) => { err.message.should.be.deepEqual(OBJECT_NOT_FOUND); })
        .then(() => { next(); });
  });

  it('should reject if scope is not integer', (next) => {
    userLDAP.search(searchBase, '2', config.ldapSearch.filterObjAll)
        .catch((err) => { err.message.should.be.deepEqual(scopeError); })
        .then(() => { next(); });
  });

  it('should reject if searchBase is not string', (next) => {
    userLDAP.search(1, 2, config.ldapSearch.filterObjAll)
        .catch((err) => { err.message.should.be.deepEqual(searchBseError); })
        .then(() => { next(); });
  });


  /**
   * test case with a single result
   */

  it('should return a single result', (next) => {
    adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific2)
        .then((result) => {
          const count = (result.match(/\ndn:/g) || []).length;
          count.should.be.eql(1);
        })
        .then(() => { next(); });
  });

  /**
   * test case with multiple results on the same level( scope argument 1?)
   *
   **/
  it('should return multiple results located on the same level', (next) => {
    adminLDAP.search(searchBase, 1, config.ldapSearch.filterObjAll)
        .then((result) => {
          const count = (result.match(/\ndn:/g) || []).length;
          count.should.be.above(1);
        })
        .then(() => { next(); });
  });

  /**
   * test case with sequential identical searches
   */

  it('should return the same result', (next) => {

    adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific2)
        .then((res1) => {
          adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific2)
              .then((res2) => {
                should.deepEqual(res1, res2);
                next();
              });

        });
  });

  /**
   * case with sequential different searches(including error cases)
   */
  it('should return sequential different results and errors', (next) => {

    adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific2)
        .then((result1) => {
          adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific)
              .then((result2) => {
                should.notDeepEqual(result1, result2);
                adminLDAP.search(searchBase, 1, config.ldapSearch.filterObjAll)
                    .then((result3) => {
                      should.notDeepEqual(result1, result3);
                      should.notDeepEqual(result2, result3);
                      adminLDAP
                          .search(
                              'dc=wrongBase,dc=err', 2, 'objectClass=errors')
                          .catch((err) => {
                            err.should.not.be.empty;
                            next();
                          });
                    });
              });
        });
  });

  /**
   * test cases for parallel searches
   */

  it('should return search results done in parallel', (next) => {
    const firstResult =
        adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific2);
    const secondResult =
        adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific2);
    const thirdResult =
        adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific);

    Promise.all([firstResult, secondResult, thirdResult])
        .then((values) => {
          should.deepEqual(values[0], values[1]);
          should.notDeepEqual(values[0], values[2]);
          should.notDeepEqual(values[1], values[2]);
        })
        .then(() => { next(); });
  });

  /**
   * Test case with a large number of results (>10k)
   */
  it('should return >10k entries', function(next) {
    this.timeout(0);

    adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjAll)
        .then((result) => {
          const count = (result.match(/\ndn:/g) || []).length;
          count.should.be.above(10000);
        })
        .then(() => { next(); });
  });

  it('should return results in entire subtree', (next) => {
    adminLDAP.search(searchBase, 2, config.ldapSearch.filterObjSpecific3)
        .then((result) => {
          const count = (result.match(/\ndn:/g) || []).length;
          count.should.be.above(1);
        })
        .then(() => { next(); });
  });
});
