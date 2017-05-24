'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const jsonMap = require('../modules/mappingJsonObject/mappingStringJson.js');

describe('Testing the async LDAP search ', () => {
  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const searchBase = 'dc=demoApp,dc=com';
  

  const password = 'secret';
  let clientLDAP = new LDAPWrap(host);

  beforeEach((next) => {
    clientLDAP = new LDAPWrap(host);


    clientLDAP.initialize()
      .then(() => {
        clientLDAP.bind(dnAdmin, password)
          .then(() => {
            next();
          });

      });
  });
  afterEach(() => {
    clientLDAP.unbind()
      .then(() => {

      });
  });

  it('should return an empty search', (next) => {
    clientLDAP.search(searchBase, 2, 'objectclass=aliens')
      .then((result) => {
        result.should.be.empty;
      })
      .then(() => {
        next();
      });
  });
  /**
   * case for search with non existing search base
   */
  it('should return the root node', (next) => {
    clientLDAP.search('', 0, 'objectclass=*')
      .then((result) => {
        const baseDN = '\ndn:\nobjectClass:top\nobjectClass:OpenLDAProotDSE\n\n';
        should.deepEqual(result, baseDN);

      })
      .then(() => {
        next();
      });

  });
  /**
   * test case for search with access denied
   */

  it('should return nothing', (next) => {
    clientLDAP.unbind()
      .then(() => {
        clientLDAP.bind(dnUser, password)
          .then(() => {
            clientLDAP.search(searchBase, 2, 'objectClass=*')
              .then((result) => {
                should.deepEqual(result, undefined);
              });
          });
      })
      .then(() => {
        next();
      });

  });

  /**
   * test case with a single result
   */

  it('should return a single result', (next) => {
    clientLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
      .then((result) => {
        const singleResult = '\ndn:cn=admin,dc=demoApp,dc=com\nobjectClass:simpleSecurityObject\nobjectClass:organizationalRole\ncn:admin\ndescription:LDAP administrator\nuserPassword:{SSHA}UU9JBg/X7r6HK/ARkYnmRTLTCNNisZFA\n\n';
        should.deepEqual(result, singleResult);
      })
      .then(() => {
        next();
      });
  });

  /**
   * test case with multiple results on the same level( scope argument 1?)
   * unfinished
   */
  it('should return multiple results located on the same level', (next) => {
    clientLDAP.search(searchBase, 1, 'objectClass=*')
      .then((result) => {
        should.notDeepEqual(result, undefined); //  unclear on what to compare it with
      })
      .then(() => {
        next();
      });
  });

  /**
   * test case with sequential identical searches
   */

  it('should return the same result', (next) => {

    clientLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
      .then((res1) => {
        clientLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
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

    clientLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject')
      .then((result1) => {
        clientLDAP.search(searchBase, 2, 'objectClass=aliens')
          .then((result2) => {
            should.notDeepEqual(result1, result2);
            clientLDAP.search(searchBase, 1, 'objectClass=*')
              .then((result3) => {
                should.notDeepEqual(result1, result3);
                should.notDeepEqual(result2, result3);
                clientLDAP.search('dc=wrongBase,dc=err', 2, 'objectClass=errors')
                  .catch((err) => {

                    should.deepEqual(err.message, 'The Search Operation Failed');
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
    const firstResult = clientLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject');
    const secondResult = clientLDAP.search(searchBase, 2, 'objectClass=simpleSecurityObject');
    const thirdResult = clientLDAP.search(searchBase, 2, 'objectClass=aliens');

    Promise.all([firstResult, secondResult, thirdResult])
      .then((values) => {
        should.deepEqual(values[0], values[1]);
        should.notDeepEqual(values[0], values[2]);
        should.notDeepEqual(values[1], values[2]);
      })
      .then(() => {
        next();
      });
  });

  /**
   * Test case with a large number of results (>10k)
   */
  it('should return 10k entries',(next) => {
   // setTimeout(next,30000);

    clientLDAP.search(searchBase,2,'objectClass=person')
      .then( (result) => {
       let json = jsonMap.stringLDAPtoJSON(result);
       let size = Object.keys(json).length;
       console.log(size);
       size.should.be.approximately(10000,100);
      })
        .then(() => {
          next();
        })
          .catch( () => {
            console.log("bad news!");
          })
  });

 


});