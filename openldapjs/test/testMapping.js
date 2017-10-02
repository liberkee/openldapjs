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
    const expectResult =
      '{"type":"content","version":null,"entries":[{"type":"record","dn":"cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com","attributes":[{"attribute":{"type":"attribute","options":[],"attribute":"objectClass"},"value":{"type":"value","value":"person"}},{"attribute":{"type":"attribute","options":[],"attribute":"sn"},"value":{"type":"value","value":"Ghitea Cosmin"}},{"attribute":{"type":"attribute","options":[],"attribute":"seeAlso"},"value":{"type":"value","value":"cn=T1"}},{"attribute":{"type":"attribute","options":[],"attribute":"seeAlso"},"value":{"type":"value","value":"cn=T3"}},{"attribute":{"type":"attribute","options":[],"attribute":"seeAlso"},"value":{"type":"value","value":"cn=HTML"}},{"attribute":{"type":"attribute","options":[],"attribute":"cn"},"value":{"type":"value","value":"cghitea"}},{"attribute":{"type":"attribute","options":[],"attribute":"userPassword"},"value":{"type":"value","value":"{SSHA}MCSuMlR/r/sO5XFs8oPplBC6Mc//Vj38"}},{"attribute":{"type":"attribute","options":[],"attribute":"description"},"value":{"type":"value","value":"1Modification"}},{"attribute":{"type":"attribute","options":[],"attribute":"description"},"value":{"type":"value","value":"2Modification"}},{"attribute":{"type":"attribute","options":[],"attribute":"description"},"value":{"type":"value","value":"3Modification"}}]}]}';
    return adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser)
      .then((res) => {
        const jsonRes = ldif.parse(res);
        should.deepEqual(JSON.stringify(jsonRes), expectResult);
      });
  });

  it('should return all the result as json', () => {

    const search1 =
      adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser);
    const search2 =
      adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser);
    const search3 =
      adminLDAP.search(searchBase, scopeSearch.subtree, filterSpecificUser);


    return Promise.all([search1, search2, search3])
      .then((results) => {
        results.forEach((element) => {
          const jsonRes = ldif.parse(element);
          jsonRes.should.be.json;
        });
      });
  });

});
