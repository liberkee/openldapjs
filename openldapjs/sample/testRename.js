'use strict';

const LDAPCLIENT = require('../modules/ldapAsyncWrap.js');


const host = 'ldap://localhost:389';
const dn = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const password = 'secret';
const base = 'ou=users,o=myhost,dc=demoApp,dc=com';
const scope = 2;
const filter = '(objectclass=*)';
const dnCompare = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
const filterCompare = 'description';
const value = 'cghitea@gmail.com';
const newClient = new LDAPCLIENT(host);
const config = require('./config.json');
const Promise = require('bluebird');

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
    iscritical: config.ldapControls.ldapModificationControlPostRead.iscritical,
  },
  {
    oid: config.ldapControls.ldapModificationControlPreRead.oid,
    value: config.ldapControls.ldapModificationControlPreRead.value,
    iscritical: config.ldapControls.ldapModificationControlPreRead.iscritical,
  },
];

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

const attr = config.ldapCompare.attribute;
const val = config.ldapCompare.value;
const searchBase = config.ldapSearch.searchBase;

const comparisonResTrue = 'The Comparison Result: true';
const entry = {objectClass: 'inetOrgPerson', sn: 'Entryz', description: 'Testz'};
const newEntry = 'cn=newPointChild111';
const dnUser = `${newEntry}${config.ldapAdd.dnNewEntry}`;

let attributeEntry = newEntry.split('=');
attributeEntry = attributeEntry[1];
const searchResult =
    `\ndn:${newEntry}${config.ldapAdd.dnNewEntry}\nobjectClass:person\nsn:Entry\ndescription:Tesst\ncn:${attributeEntry}\n\n`;


newClient.initialize()
.then(() => {
  newClient.bind('cn=admin,dc=demoApp,dc=com', 'secret')
  .then(() => {
    const add1 = newClient.add(dnUser, validEntry, controlOperation);
    const delete1 = newClient.del(dnUser, controlOperation);
    const search1 =
        newClient.search(searchBase, searchScope.subtree, newEntry);
    const compare1 = newClient.compare(dn, attr, val);
    const modify1 = newClient.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes,
        controlOperation);
    const dnUserNew = `${newEntry}1${config.ldapAdd.dnNewEntry}`;

    const add2 = newClient.add(dnUserNew, validEntry, controlOperation);
    const delete2 = newClient.del(dnUserNew, controlOperation);
    const search2 =
        newClient.search(searchBase, searchScope.subtree, newEntry);
    const modify2 = newClient.modify(
        config.ldapModify.ldapModificationReplace.change_dn, changeAttirbutes,
        controlOperation);
    const compare2 = newClient.compare(dn, attr, val);

    Promise
        .all([
          add1, add2, modify1, modify2, delete1, delete2, compare1, compare2,
          search1, search2,
        ])
        .then((results) => {
          results.forEach((element) => {
            if (element === searchResult) {
              console.log(element);
            } else if (element === comparisonResTrue) {
              console.log(element);
            } else {
              let resultOperation;
              resultOperation = element.split('\n');
              resultOperation = resultOperation[1].split(':');
              resultOperation = resultOperation[1];
              if (resultOperation === ` ${config.ldapModify.ldapModificationReplace.change_dn}`) {
                console.log(element);
              } else {
                console.log(element);
              }
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
  });
});
