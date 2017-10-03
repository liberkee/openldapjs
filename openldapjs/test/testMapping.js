'use strict';

const should = require('should');
const ldif = require('ldif');
const config = require('./config.json');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

const scopeSearch = {
  base: 'BASE',
  one: 'ONE',
  subtree: 'SUBTREE',
};

describe('Test mapping string to JSON', () => {
  const host = config.ldapAuthentication.host;
  const dnAdmin = config.ldapAuthentication.dnAdmin;
  const dnUser = config.ldapAuthentication.dnUser;
  let adminLDAP = new LDAPWrap(host);

  const searchBase = config.ldapSearch.searchBase;
  const filterSpecificUser = config.ldapSearch.rdnUser;

  beforeEach(() => {
    adminLDAP = new LDAPWrap(host);

    const init = adminLDAP.initialize();
    const bind = adminLDAP.bind(
        config.ldapAuthentication.dnAdmin,
        config.ldapAuthentication.passwordAdmin);
    return Promise.all([init, bind]);
  });

  afterEach(() => { return adminLDAP.unbind(); });

  it('should return the string as JSON', () => {
    const jsonResults = [];
    const stringResult = [];
    return adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser)
        .then((res) => {
          const jsonRes = ldif.parse(res);
          let stringRes = res.split('\n');
          stringRes.forEach((element) => {
            if (element !== '') {
              stringRes = element.split(': ');
              if (stringRes[1] !== '') {
                stringResult.push(stringRes[1]);
              }
            }
          });
          jsonResults.push(jsonRes.entries[0].dn);
          jsonRes.entries[0].attributes.forEach(
              (element) => { jsonResults.push(element.value.value); });
        })
        .then(() => { should.deepEqual(jsonResults, stringResult); });
  });

  it('should return all the result as json', () => {

    const search1 =
        adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser);
    const search2 =
        adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser);
    const search3 =
        adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser);


    return Promise.all([search1, search2, search3]).then((results) => {
      results.forEach((element) => {
        const jsonRes = ldif.parse(element);
        const resultShoudBe = jsonRes.should.be.json;  // what's going on here ?
      });
    });
  });

});
