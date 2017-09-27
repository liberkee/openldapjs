'use strict';

const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');
const config = require('./config.json');
const errList = require('./errorlist.json');

describe('Testing multiple operations functionalities', () => {
  const hostAddress = config.ldapAuthentication.host;
  const dn = config.ldapAuthentication.dnAdmin;
  const password = config.ldapAuthentication.passwordAdmin;
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const attr = config.ldapCompare.attribute;
  const val = config.ldapCompare.value;
  const searchBase = config.ldapSearch.searchBase;

  const newEntry = 'cn=newPointChild111';

  const searchScope = {
    base: 0,
    oneLevel: 1,
    subtree: 2,
  };

  const validEntry = {
    objectClass: config.ldapAdd.objectClass,
    sn: config.ldapAdd.sn,
    description: config.ldapAdd.description,
  };

  const changeAttributes = [
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
      isCritical:
          config.ldapControls.ldapModificationControlPostRead.isCritical,
    },
    {
      oid: config.ldapControls.ldapModificationControlPreRead.oid,
      value: config.ldapControls.ldapModificationControlPreRead.value,
      isCritical: config.ldapControls.ldapModificationControlPreRead.isCritical,
    },
  ];

  const dnUser = `${newEntry}${config.ldapAdd.dnNewEntry}`;

  let attributeEntry = newEntry.split('=');
  attributeEntry = attributeEntry[1];
  const searchResult =
      `\ndn:${newEntry}${config.ldapAdd.dnNewEntry}\nobjectClass:person\nsn:Entry\ndescription:Tesst\ncn:${attributeEntry}\n\n`;

  beforeEach(() => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    return ldapAsyncWrap.initialize().then(
        () => { return ldapAsyncWrap.bind(dn, password); });
  });

  afterEach(() => { return ldapAsyncWrap.unbind(); });


  it('should add, search, compare, modify and delete  in multiple times sequential',  // wtf ?
     () => {
       return ldapAsyncWrap.add(dnUser, validEntry, controlOperation)
           .then((result1) => {
             let resultOperation;
             resultOperation = result1.split('\n');
             resultOperation = resultOperation[1].split(':');
             resultOperation = resultOperation[1];
             should.deepEqual(resultOperation, ` ${dnUser}`);
             return ldapAsyncWrap.search(
                 searchBase, searchScope.subtree, newEntry);
           })
           .then((result2) => {
             should.deepEqual(result2, searchResult);
             return ldapAsyncWrap.modify(
                 config.ldapModify.ldapModificationReplace.change_dn,
                 changeAttributes, controlOperation);
           })
           .then((result3) => {
             let resultOperation;
             resultOperation = result3.split('\n');
             resultOperation = resultOperation[1].split(':');
             resultOperation = resultOperation[1];
             should.deepEqual(
                 resultOperation,
                 ` ${config.ldapModify.ldapModificationReplace.change_dn}`);
             return ldapAsyncWrap.delete(dnUser, controlOperation);
           })
           .then((result4) => {
             let resultOperation;
             resultOperation = result4.split('\n');
             resultOperation = resultOperation[1].split(':');
             resultOperation = resultOperation[1];
             should.deepEqual(resultOperation, ` ${dnUser}`);
             return ldapAsyncWrap.compare(dn, attr, val);
           })

           .then((result5) => {
             should.deepEqual(result5, errList.comparisonResTrue);
             return ldapAsyncWrap.add(dnUser, validEntry, controlOperation);
           })
           .then((result6) => {
             let resultOperation;
             resultOperation = result6.split('\n');
             resultOperation = resultOperation[1].split(':');
             resultOperation = resultOperation[1];
             should.deepEqual(resultOperation, ` ${dnUser}`);
             return ldapAsyncWrap.search(
                 searchBase, searchScope.subtree, newEntry);
           })
           .then((result7) => {
             should.deepEqual(result7, searchResult);
             return ldapAsyncWrap.delete(dnUser, controlOperation);
           })
           .then((result8) => {
             let resultOperation;
             resultOperation = result8.split('\n');
             resultOperation = resultOperation[1].split(':');
             resultOperation = resultOperation[1];
             should.deepEqual(resultOperation, ` ${dnUser}`);
             return ldapAsyncWrap.modify(
                 config.ldapModify.ldapModificationReplace.change_dn,
                 changeAttributes, controlOperation);
           })
           .then((result9) => {
             let resultOperation;
             resultOperation = result9.split('\n');
             resultOperation = resultOperation[1].split(':');
             resultOperation = resultOperation[1];
             should.deepEqual(
                 resultOperation,
                 ` ${config.ldapModify.ldapModificationReplace.change_dn}`);
             return ldapAsyncWrap.compare(dn, attr, val);
           })

           .then((result10) => {
             should.deepEqual(result10, errList.comparisonResTrue);
           });
     });

  it('should make multiple operation in parallel', () => {
    const dnUserNew = `${newEntry}1${config.ldapAdd.dnNewEntry}`;
    let searchEntry = config.ldapAuthentication.dnUser.split(',');
    searchEntry = searchEntry[0];

    const addOP = ldapAsyncWrap.add(dnUser, validEntry, controlOperation)
    const deleteOp = ldapAsyncWrap.delete(dnUser, controlOperation);
    const searchOP =
        ldapAsyncWrap.search(searchBase, searchScope.subtree, searchEntry);
    const searchOP2 =
        ldapAsyncWrap.search(searchBase, searchScope.subtree, searchEntry);
    const compareOP = ldapAsyncWrap.compare(dn, attr, val);
    const compareOP2 = ldapAsyncWrap.compare(dn, attr, val);
    const modifyOP = ldapAsyncWrap.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttributes,
        controlOperation);
    const modifyOP2 = ldapAsyncWrap.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttributes,
        controlOperation);

    return Promise
        .all([
          addOP, searchOP, deleteOp, compareOP, modifyOP, searchOP2, compareOP2, modifyOP2
        ].map(p => p.catch(e => e)))
        .then((results) => {
          results.forEach((element) => {
            if (element === errList.ldapNoSuchObject) {
              should.deepEqual(element, errList.alreadyExists);
            } else if (element === errList.alreadyExists) {
              should.deepEqual(element, errList.alreadyExists);
            } else if (element === errList.comparisonResTrue) {
              should.deepEqual(errList.comparisonResTrue, element);
            } else {
              let resultOperation;
              resultOperation = element.split('\n');
              resultOperation = resultOperation[1].split(':');
              resultOperation = resultOperation[1];

              if (resultOperation === config.ldapAuthentication.dnUser) {
                should.deepEqual(
                    resultOperation, `${config.ldapAuthentication.dnUser}`);
              } else if (
                  resultOperation ===
                  ` ${config.ldapModify.ldapModificationReplace.change_dn}`) {
                should.deepEqual(
                    resultOperation,
                    ` ${config.ldapModify.ldapModificationReplace.change_dn}`);
              } else if (resultOperation === ` ${dnUser}`) {
                should.deepEqual(resultOperation, ` ${dnUser}`);
              } else {
                should.deepEqual(
                    resultOperation,
                    ` ${newEntry}1${config.ldapAdd.dnNewEntry}`);
              }
            }
          });
        });
  });
});
