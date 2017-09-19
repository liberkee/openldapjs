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
  const newEntry = 'cn=newPointChild111';
  const searchScope = {
    base: 0,
    oneLevel: 1,
    subtree: 2
  }

  const validEntry = {
    objectClass: config.ldapAdd.objectClass,
    sn: config.ldapAdd.sn,
    description: config.ldapAdd.description,
  }

  const changeAttirbutes = [
    {
      op: config.ldapModify.ldapModificationReplace.operation,
      attr: config.ldapModify.ldapModificationReplace.attribute,
      vals: config.ldapModify.ldapModificationReplace.vals,
    },
    {
      op: config.ldapModify.ldapModificationAdd.operation,
      attr: config.ldapModify.ldapModificationAdd.attribute,
      vals: config.ldapModify.ldapModificationAdd.vals,
    },
    {
      op: config.ldapModify.ldapModificationDelete.operation,
      attr: config.ldapModify.ldapModificationDelete.attribute,
      vals: config.ldapModify.ldapModificationDelete.vals,
    },
  ];

  const controlOperation = [
    {
      oid: config.ldapControls.ldapModificationControlPostRead.oid,
      value: config.ldapControls.ldapModificationControlPostRead.value,
      iscritical:
          config.ldapControls.ldapModificationControlPostRead.iscritical,
    },
    {
      oid: config.ldapControls.ldapModificationControlPreRead.oid,
      value: config.ldapControls.ldapModificationControlPreRead.value,
      iscritical: config.ldapControls.ldapModificationControlPreRead.iscritical,
    },
  ];

  '\ndn:cn=newPointChild111,cn=newPoint,ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:person\nsn:Entry\ndescription:Tesst\ncn=newPointChild111\n\n'

  const dnUser = `${newEntry}${config.ldapAdd.dnNewEntry}`;

  let attributeEntry = newEntry.split('=');
  attributeEntry = attributeEntry[1];
  const searchResult =
      `\ndn:${newEntry}${config.ldapAdd.dnNewEntry}\nobjectClass:person\nsn:Entry\ndescription:Tesst\ncn:${attributeEntry}\n\n`;

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


  it('should add, search, comparte, modify and delete  in multiple times sequential', (next) => {
  ldapAsyncWrap.add(dnUser, validEntry, controlOperation)
  .then((result1) => {
    let resultOperation;
    resultOperation = result1.split('\n');
    resultOperation = resultOperation[1].split(':');
    resultOperation = resultOperation[1];
    should.deepEqual(resultOperation, ` ${dnUser}`); 
  })
  .then(() => {
    ldapAsyncWrap.search(searchBase, searchScope.subtree, newEntry)
    .then((result2) => {
      should.deepEqual(result2, searchResult);
    })
    .then(() => {
      ldapAsyncWrap.modify(config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes, controlOperation)
      .then((result3) => {
        let resultOperation;
        resultOperation = result3.split('\n');
        resultOperation = resultOperation[1].split(':');
        resultOperation = resultOperation[1];
        should.deepEqual(resultOperation, ` ${config.ldapModify.ldapModificationReplace.change_dn}`);
      })
      .then(() => {
        ldapAsyncWrap.del(dnUser, controlOperation)
          .then((result4) => {
            let resultOperation;
            resultOperation = result4.split('\n');
            resultOperation = resultOperation[1].split(':');
            resultOperation = resultOperation[1];
            should.deepEqual(resultOperation, ` ${dnUser}`);
          })
          .then(() => {
            ldapAsyncWrap.compare(dn, attr, val)
            .then((result5) => {
              should.deepEqual(result5, comparisonResTrue);
            })
            .then(() => {
              ldapAsyncWrap.add(dnUser, validEntry, controlOperation)
              .then((result6) => {
                let resultOperation;
                resultOperation = result6.split('\n');
                resultOperation = resultOperation[1].split(':');
                resultOperation = resultOperation[1];
                should.deepEqual(resultOperation, ` ${dnUser}`); 
              })
              .then(() => {
                ldapAsyncWrap.search(searchBase, searchScope.subtree, newEntry)
                .then((result7) => {
                  should.deepEqual(result7, searchResult);
                })
                .then(() => {
                  ldapAsyncWrap.del(dnUser, controlOperation)
                  .then((result8) => {
                    let resultOperation;
                    resultOperation = result8.split('\n');
                    resultOperation = resultOperation[1].split(':');
                    resultOperation = resultOperation[1];
                    should.deepEqual(resultOperation, ` ${dnUser}`); 
                  })
                  .then(() => {
                    ldapAsyncWrap.modify(config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes, controlOperation)
                    .then((result9) => {
                      let resultOperation;
                      resultOperation = result9.split('\n');
                      resultOperation = resultOperation[1].split(':');
                      resultOperation = resultOperation[1];
                      should.deepEqual(resultOperation, ` ${config.ldapModify.ldapModificationReplace.change_dn}`); 
                    })
                    .then(() => {
                      ldapAsyncWrap.compare(dn, attr, val)
                      .then((result10) => {
                        should.deepEqual(result10, comparisonResTrue);
                      })
                      .then(() => {
                        next();
                      })                                                                             
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

  it('should make multiple operation in parallel', (next) => {
    const add1 = ldapAsyncWrap.add(dnUser, validEntry, controlOperation);
    const delete1 = ldapAsyncWrap.del(dnUser, controlOperation);
    const search1 = ldapAsyncWrap.search(searchBase, searchScope.subtree, newEntry);
    const compare1 = ldapAsyncWrap.compare(dn, attr, val);    
    const modify1 = ldapAsyncWrap.modify(config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes, controlOperation);
    
    const dnUserNew = `${newEntry}1${config.ldapAdd.dnNewEntry}`;

    const add2 =   ldapAsyncWrap.add(dnUserNew, validEntry, controlOperation);
    const delete2 = ldapAsyncWrap.del(dnUserNew, controlOperation);
    const search2 = ldapAsyncWrap.search(searchBase, searchScope.subtree, newEntry);
    const modify2 = ldapAsyncWrap.modify(config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes, controlOperation);
    const compare2 = ldapAsyncWrap.compare(dn, attr, val);

    Promise.all([add1, add2, delete1, delete2, modify1, modify2, search1, search2, compare1, compare2])
    .then((results) => {
      results.forEach((element) => {
        if (element === searchResult) {
          should.deepEqual(searchResult, element);
        }
        else if(element === comparisonResTrue) {
          should.deepEqual(comparisonResTrue, element);
        }
        else {
          let resultOperation;
          resultOperation = element.split('\n');
          resultOperation = resultOperation[1].split(':');
          resultOperation = resultOperation[1];
          if (resultOperation === ` ${config.ldapModify.ldapModificationReplace.change_dn}`)
            should.deepEqual(resultOperation, ` ${config.ldapModify.ldapModificationReplace.change_dn}`);
          else if (resultOperation === ` ${dnUser}`)
            should.deepEqual(resultOperation, ` ${dnUser}`);
          else 
          should.deepEqual(resultOperation, ` ${newEntry}1${config.ldapAdd.dnNewEntry}`);
        }
      });
    })
    .then(() => {
       next(); 
      });
  });

});
