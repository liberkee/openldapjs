'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const jsonMap = require('../modules/mappingJsonObject/mappingStringJson.js');

const OBJECT_NOT_FOUND = '32';
const ROOT_NODE = '\ndn:\nobjectClass:top\nobjectClass:OpenLDAProotDSE\n\n';

describe('Testing the async LDAP search ', () => {


  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const searchBase = 'dc=demoApp,dc=com';

  const password = 'secret';
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

  it('should return an empty search', (next) => {
    adminLDAP.search(searchBase, 2, 'objectclass=aliens')
        .then((result) => { result.should.be.empty; })
        .then(() => { next(); });
  });
  /**
   * case for search with non existing search base
   */
  it('should return the root node', (next) => {
    adminLDAP.search('', 0, 'objectclass=*')
        .then((result) => { should.deepEqual(result, ROOT_NODE); })
        .then(() => { next(); });

  });
  /**
   * test case for search with access denied
   */

  it('should return an LDAP_OBJECT_NOT_FOUND error', (next) => {
    userLDAP.search(searchBase, 2, 'objectClass=*')
        .catch((err) => { err.message.should.be.deepEqual(OBJECT_NOT_FOUND); })
        .then(() => { next(); });
  });


  /**
   * test case with a single result
   */

  it('should return a single result', (next) => {
    adminLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
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
    adminLDAP.search(searchBase, 1, 'objectClass=*')
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

    adminLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
        .then((res1) => {
          adminLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
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

    adminLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
        .then((result1) => {
          adminLDAP.search(searchBase, 2, 'objectClass=aliens')
              .then((result2) => {
                should.notDeepEqual(result1, result2);
                adminLDAP.search(searchBase, 1, 'objectClass=*')
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
        adminLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject');
    const secondResult =
        adminLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject');
    const thirdResult = adminLDAP.search(searchBase, 2, 'objectClass=aliens');

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

    adminLDAP.search(searchBase, 2, 'objectClass=*')
        .then((result) => {
          const count = (result.match(/\ndn:/g) || []).length;
          count.should.be.above(10000);
        })
        .then(() => { next(); });
  });

  it('should return results in entire subtree', (next) => {

    adminLDAP.search(searchBase, 2, 'objectClass=inetOrgPerson')
        .then((result) => {
          const count = (result.match(/\ndn:/g) || []).length;
          count.should.be.above(1);
        })
        .then(() => { next(); });
  });
});
