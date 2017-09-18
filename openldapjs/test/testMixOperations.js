'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');

describe('Testing the Compare functionalities', () => {
  const hostAddress = config.ldapAuthentification.host;
  const dn = config.ldapAuthentification.dnAdmin;
  const password = config.ldapAuthentification.passwordAdmin;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const attr = config.ldapCompare.attribute;
  const val = config.ldapCompare.value;
  const searchBase = config.ldapSearch.searchBase;

  const nonVal = 'nonExistingValue';
  const nonAttr = 'nonExistingAttr';
  const nonObj = config.ldapCompare.invalidUser;
  const noPass = config.ldapCompare.invalidPassword;

  const comparisonResTrue = 'The Comparison Result: true';
  const comparisonResFalse = 'The Comparison Result: false';
  const LDAP_UNDEFINED_TYPE = '17';
  const LDAP_NO_SUCH_OBJECT = '32';

  const searchResult =
      '\ndn:cn=newPointChild10000,cn=newPoint,ou=template,o=myhost,dc=demoApp,dc=com\nobjectClass:person\nsn:FU\ndescription:newdescription10000\ncn:newPointChild10000\n\n';

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    ldapAsyncWrap.initialize().then(
        () => { ldapAsyncWrap.bind(dn, password).then(() => { next(); }); });
  });

  afterEach(() => {
    ldapAsyncWrap.unbind().then(
        () => {

        });
  });


  it(
      'should search and comparte 10 times sequential', (next) => {
        ldapAsyncWrap
            .search(searchBase, 2, config.ldapSearch.filterObjSpecific4)
            .then((result1) => { 
                should.deepEqual(result1, searchResult); 
            })
            .then(
                () => {
                  ldapAsyncWrap
                      .search(
                          searchBase, 2, config.ldapSearch.filterObjSpecific4)
                      .then((result2) => {
                        should.deepEqual(result2, searchResult);
                      })
                      .then(
                          () => {
                            ldapAsyncWrap
                                .search(
                                    searchBase, 2,
                                    config.ldapSearch.filterObjSpecific4)
                                .then((result3) => {
                                  should.deepEqual(result3, searchResult);
                                })
                                .then(
                                    () => {
                                      ldapAsyncWrap
                                          .search(
                                              searchBase, 2,
                                              config.ldapSearch
                                                  .filterObjSpecific4)
                                          .then((result4) => {
                                            should.deepEqual(
                                                result4, searchResult);
                                          })
                                          .then(
                                              () => {
                                                ldapAsyncWrap
                                                    .search(
                                                        searchBase, 2,
                                                        config.ldapSearch
                                                            .filterObjSpecific4)
                                                    .then((result5) => {
                                                      should.deepEqual(
                                                          result5,
                                                          searchResult);
                                                    })
                                                    .then(
                                                        () => {
                                                          ldapAsyncWrap
                                                              .search(
                                                                  searchBase, 2,
                                                                  config
                                                                      .ldapSearch
                                                                      .filterObjSpecific4)
                                                              .then((result6) => {
                                                                should.deepEqual(
                                                                    result6,
                                                                    searchResult);
                                                              })
                                                              .then(
                                                                  () => {
                                                                    ldapAsyncWrap
                                                                        .search(
                                                                            searchBase,
                                                                            2,
                                                                            config
                                                                                .ldapSearch
                                                                                .filterObjSpecific4)
                                                                        .then((result7) => {
                                                                          should.deepEqual(
                                                                              result7,
                                                                              searchResult);
                                                                        })
                                                                        .then(
                                                                            () => {
                                                                              ldapAsyncWrap
                                                                                  .search(
                                                                                      searchBase,
                                                                                      2,
                                                                                      config
                                                                                          .ldapSearch
                                                                                          .filterObjSpecific4)
                                                                                  .then((result8) => {
                                                                                    should
                                                                                        .deepEqual(
                                                                                            result8,
                                                                                            searchResult);
                                                                                  })
                                                                                  .then(() => {
                                                                                    ldapAsyncWrap
                                                                                        .search(
                                                                                            searchBase,
                                                                                            2,
                                                                                            config
                                                                                                .ldapSearch
                                                                                                .filterObjSpecific4)
                                                                                        .then((result9) => {
                                                                                          should
                                                                                              .deepEqual(
                                                                                                  result9,
                                                                                                  searchResult);
                                                                                        })
                                                                                        .then(() => {
                                                                                          ldapAsyncWrap
                                                                                              .search(
                                                                                                  searchBase,
                                                                                                  2,
                                                                                                  config
                                                                                                      .ldapSearch
                                                                                                      .filterObjSpecific4)
                                                                                              .then((result10) => {
                                                                                                should
                                                                                                    .deepEqual(
                                                                                                        result10,
                                                                                                        searchResult);
                                                                                              })
                                                                                              .then(
                                                                                                  () => {
                                                                                                    ldapAsyncWrap
                                                                                                        .compare(
                                                                                                            dn,
                                                                                                            attr,
                                                                                                            val)
                                                                                                        .then((compareResult1) => {
                                                                                                          should
                                                                                                              .deepEqual(
                                                                                                                  compareResult1,
                                                                                                                  comparisonResTrue);
                                                                                                        })
                                                                                                        .then(
                                                                                                            () => {
                                                                                                              ldapAsyncWrap
                                                                                                                  .compare(
                                                                                                                      dn,
                                                                                                                      attr,
                                                                                                                      val)
                                                                                                                  .then((compareResult2) => {
                                                                                                                    should
                                                                                                                        .deepEqual(
                                                                                                                            compareResult2,
                                                                                                                            comparisonResTrue);
                                                                                                                  })
                                                                                                                  .then(
                                                                                                                      () => {
                                                                                                                        ldapAsyncWrap
                                                                                                                            .compare(
                                                                                                                                dn,
                                                                                                                                attr,
                                                                                                                                val)
                                                                                                                            .then((compareResult3) => {
                                                                                                                              should
                                                                                                                                  .deepEqual(
                                                                                                                                      compareResult3,
                                                                                                                                      comparisonResTrue);
                                                                                                                            })
                                                                                                                            .then(() => {
                                                                                                                              ldapAsyncWrap
                                                                                                                                  .compare(
                                                                                                                                      dn,
                                                                                                                                      attr,
                                                                                                                                      val)
                                                                                                                                  .then((compareResult4) => {
                                                                                                                                    should
                                                                                                                                        .deepEqual(
                                                                                                                                            compareResult4,
                                                                                                                                            comparisonResTrue);
                                                                                                                                  })
                                                                                                                                  .then(
                                                                                                                                      () => {
                                                                                                                                        ldapAsyncWrap
                                                                                                                                            .compare(
                                                                                                                                                dn,
                                                                                                                                                attr,
                                                                                                                                                val)
                                                                                                                                            .then((compareResult5) => {
                                                                                                                                              should
                                                                                                                                                  .deepEqual(
                                                                                                                                                      compareResult5,
                                                                                                                                                      comparisonResTrue);
                                                                                                                                            })
                                                                                                                                            .then(() => {
                                                                                                                                              ldapAsyncWrap
                                                                                                                                                  .compare(
                                                                                                                                                      dn,
                                                                                                                                                      attr,
                                                                                                                                                      val)
                                                                                                                                                  .then((compareResult6) => {
                                                                                                                                                    should
                                                                                                                                                        .deepEqual(
                                                                                                                                                            compareResult6,
                                                                                                                                                            comparisonResTrue);
                                                                                                                                                  })
                                                                                                                                                  .then(
                                                                                                                                                      () => {
                                                                                                                                                        ldapAsyncWrap
                                                                                                                                                            .compare(
                                                                                                                                                                dn,
                                                                                                                                                                attr,
                                                                                                                                                                val)
                                                                                                                                                            .then((compareResult7) => {
                                                                                                                                                              should
                                                                                                                                                                  .deepEqual(
                                                                                                                                                                      compareResult7,
                                                                                                                                                                      comparisonResTrue);
                                                                                                                                                            })
                                                                                                                                                            .then(
                                                                                                                                                                () => {
                                                                                                                                                                  ldapAsyncWrap
                                                                                                                                                                      .compare(
                                                                                                                                                                          dn,
                                                                                                                                                                          attr,
                                                                                                                                                                          val)
                                                                                                                                                                      .then((compareResult8) => {
                                                                                                                                                                        should
                                                                                                                                                                            .deepEqual(
                                                                                                                                                                                compareResult8,
                                                                                                                                                                                comparisonResTrue);
                                                                                                                                                                      })
                                                                                                                                                                      .then(() => {
                                                                                                                                                                        ldapAsyncWrap
                                                                                                                                                                            .compare(
                                                                                                                                                                                dn,
                                                                                                                                                                                attr,
                                                                                                                                                                                val)
                                                                                                                                                                            .then((compareResult9) => {
                                                                                                                                                                              should
                                                                                                                                                                                  .deepEqual(
                                                                                                                                                                                      compareResult9,
                                                                                                                                                                                      comparisonResTrue);
                                                                                                                                                                            })
                                                                                                                                                                            .then(() => {
                                                                                                                                                                              ldapAsyncWrap
                                                                                                                                                                                  .compare(
                                                                                                                                                                                      dn,
                                                                                                                                                                                      attr,
                                                                                                                                                                                      val)
                                                                                                                                                                                  .then((compareResult10) => {
                                                                                                                                                                                    should
                                                                                                                                                                                        .deepEqual(
                                                                                                                                                                                            compareResult10,
                                                                                                                                                                                            comparisonResTrue);
                                                                                                                                                                                  })
                                                                                                                                                                                  .then(() => {
                                                                                                                                                                                    next();
                                                                                                                                                                                  });
                                                                                                                                                                            });
                                                                                                                                                                      });
                                                                                                                                                                });
                                                                                                                                                      });
                                                                                                                                            });
                                                                                                                                      });
                                                                                                                            });
                                                                                                                      });
                                                                                                            });
                                                                                                  });
                                                                                        });
                                                                                  });
                                                                            });
                                                                  });
                                                        });
                                              });
                                    });
                          });
                });
      });

  it('should search and compare 10 times each in parallel', (next) => {

    // Bench of Search querries
    const search1 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search2 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search3 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search4 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search5 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search6 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search7 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search8 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search9 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);
    const search10 = ldapAsyncWrap.search(
        searchBase, 2, config.ldapSearch.filterObjSpecific4);

    // Bench of Compare querries
    const compare1 = ldapAsyncWrap.compare(dn, attr, val);
    const compare2 = ldapAsyncWrap.compare(dn, attr, val);
    const compare3 = ldapAsyncWrap.compare(dn, attr, val);
    const compare4 = ldapAsyncWrap.compare(dn, attr, val);
    const compare5 = ldapAsyncWrap.compare(dn, attr, val);
    const compare6 = ldapAsyncWrap.compare(dn, attr, val);
    const compare7 = ldapAsyncWrap.compare(dn, attr, val);
    const compare8 = ldapAsyncWrap.compare(dn, attr, val);
    const compare9 = ldapAsyncWrap.compare(dn, attr, val);
    const compare10 = ldapAsyncWrap.compare(dn, attr, val);

    Promise
        .all([
          search1,  search2,  search3,  search4,  search5,  search6,  search7,
          search8,  search9,  search10, compare1, compare2, compare3, compare4,
          compare5, compare6, compare7, compare8, compare9, compare10
        ])
        .then((results) => {
          should.deepEqual(searchResult, results[0]);
          should.deepEqual(searchResult, results[1]);
          should.deepEqual(searchResult, results[2]);
          should.deepEqual(searchResult, results[3]);
          should.deepEqual(searchResult, results[4]);
          should.deepEqual(searchResult, results[5]);
          should.deepEqual(searchResult, results[6]);
          should.deepEqual(searchResult, results[7]);
          should.deepEqual(searchResult, results[8]);
          should.deepEqual(searchResult, results[9]);

          should.deepEqual(comparisonResTrue, results[10]);
          should.deepEqual(comparisonResTrue, results[11]);
          should.deepEqual(comparisonResTrue, results[12]);
          should.deepEqual(comparisonResTrue, results[13]);
          should.deepEqual(comparisonResTrue, results[14]);
          should.deepEqual(comparisonResTrue, results[15]);
          should.deepEqual(comparisonResTrue, results[16]);
          should.deepEqual(comparisonResTrue, results[17]);
          should.deepEqual(comparisonResTrue, results[18]);
          should.deepEqual(comparisonResTrue, results[19]);
        })
        .then(() => { next(); });

  });

});
