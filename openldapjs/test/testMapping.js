'use strict';

const should = require('should');
const ldif = require('ldif');
const config = require('./config.json');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

describe('Test string to Json library', () => {
  const host = config.ldapAuthentification.host;
  const dnAdmin = config.ldapAuthentification.dnAdmin;
  const dnUser = config.ldapAuthentification.dnUser;
  let adminLDAP = new LDAPWrap(host);

  const searchBase = config.ldapSearch.searchBase;
  const filterSpecificUser = config.ldapRename.newrdn;

  const noDnLdif =
      '\nobjectClass:organizationalUnit\nou:\nobjectClass:userUnit';
  const emptyDnLdif = '\ndn:\nobjectClass:organizationalUnit\nou:users';

  beforeEach(() => {
    adminLDAP = new LDAPWrap(host);

    const init = adminLDAP.initialize();
    const bind = adminLDAP.bind(
        config.ldapAuthentification.dnAdmin,
        config.ldapAuthentification.passwordAdmin);
    return Promise.all([init, bind]);
  });

  afterEach(() => { return adminLDAP.unbind(); });

  it('should return the string as JSON', () => {
    const expectResult =
        '{"type":"content","version":null,"entries":[{"type":"record","dn":"cn=mrotaru,ou=users,o=myhost,dc=demoApp,dc=com","attributes":[{"attribute":{"type":"attribute","options":[],"attribute":"objectClass"},"value":{"type":"value","value":"person"}},{"attribute":{"type":"attribute","options":[],"attribute":"sn"},"value":{"type":"value","value":"Rotariu Maxim"}},{"attribute":{"type":"attribute","options":[],"attribute":"seeAlso"},"value":{"type":"value","value":"cn=T1"}},{"attribute":{"type":"attribute","options":[],"attribute":"seeAlso"},"value":{"type":"value","value":"cn=T2"}},{"attribute":{"type":"attribute","options":[],"attribute":"seeAlso"},"value":{"type":"value","value":"cn=T3"}},{"attribute":{"type":"attribute","options":[],"attribute":"description"},"value":{"type":"value","value":"OurNewObject"}},{"attribute":{"type":"attribute","options":[],"attribute":"description"},"value":{"type":"value","value":"OurNewObjecta"}},{"attribute":{"type":"attribute","options":[],"attribute":"userPassword"},"value":{"type":"value","value":"parolanoua"}},{"attribute":{"type":"attribute","options":[],"attribute":"cn"},"value":{"type":"value","value":"mrotaru"}}]}]}';
    return adminLDAP.search(searchBase, 2, filterSpecificUser).then((res) => {
      const jsonRes = ldif.parse(res);
      should.deepEqual(JSON.stringify(jsonRes), expectResult);
    });
  });

  it('should return all the result as json', () => {

    const search1 = adminLDAP.search(searchBase, 2, filterSpecificUser);
    const search2 = adminLDAP.search(searchBase, 2, filterSpecificUser);
    const search3 = adminLDAP.search(searchBase, 2, filterSpecificUser);


    return Promise.all([search1, search2, search3]).then((results) => {
      results.forEach((element) => { 
        const jsonRes = ldif.parse(element);
        jsonRes.should.be.json; 
      });
    });
  });
  
});
