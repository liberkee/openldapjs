'use strict';

const should = require('should');
const config = require('./config.json');
const LDIF = require('../libs/utils/ldif_parser');
const LDAPWrap = require('../libs/ldap_async_wrap.js');

const ldif = new LDIF();

describe.only('Testing the LDIF parser library', () => {

  const host = config.ldapAuthentication.host;
  const dnAdmin = config.ldapAuthentication.dnAdmin;
  const searchBase = config.ldapSearch.searchBase;

  const password = config.ldapAuthentication.passwordAdmin;
  let adminLDAP = new LDAPWrap(host);

  const pathToCert = config.ldapAuthentication.pathFileToCert;

  const searchScope = {
    base: 'BASE',
    one: 'ONE',
    subtree: 'SUBTREE',
  };

  beforeEach(() => {
    adminLDAP = new LDAPWrap(host);

    return adminLDAP.initialize()
      .then(() => {
        return adminLDAP.bind(dnAdmin, password);
      });
  });

  afterEach(() => {
    return adminLDAP.unbind();
  });

  it('Should reject if the ldif is null', (next) => {
    const wrongString = null;

    try {
      const result = ldif.stringLDAPtoJSON(wrongString);
      should.fail('should not have passed');
    } catch (err) {
      should.deepEqual(err.message, 'The string is null');
    }
    next();

  });

  it('Should reject if the ldif is empty', (next) => {
    const wrongString = '';

    try {
      const result = ldif.stringLDAPtoJSON(wrongString);
      should.fail('should not have passed');
    } catch (err) {
      should.deepEqual(err.message, 'The string is empty');
    }
    next();

  });

  it('Should reject if the ldif is a number', (next) => {
    const wrongString = 15;

    try {
      const result = ldif.stringLDAPtoJSON(wrongString);
      should.fail('should not have passed');
    } catch (err) {
      should.deepEqual(err.message, 'Must be a string');
    }
    next();

  });

  it('Should reject if the ldif is not a ldif structure', (next) => {
    const wrongString = 'someRandomString';

    try {
      const result = ldif.stringLDAPtoJSON(wrongString);
      should.fail('should not have passed');
    } catch (err) {
      should.deepEqual(err.message, 'The string is not a LDAP structure');
    }
    next();

  });

  it('should resolve if the entry has special ro characters', () => {
    const userDN = `${config.ldapSearch.filterObjSpecialCharRo},${config.ldapSearch.searchBaseUser}`;
    return adminLDAP.search(searchBase, searchScope.subtree,
      config.ldapSearch.filterObjSpecialCharRo)
      .then((result) => {
        result.entry[0].dn.should.be.deepEqual(userDN);
      });
  });

  it('should resolve if the entry has special de characters', () => {
    const userDN = `${config.ldapSearch.filterObjSpecialCharDe},${config.ldapSearch.searchBaseUser}`;
    return adminLDAP.search(searchBase, searchScope.subtree,
      config.ldapSearch.filterObjSpecialCharDe)
      .then((result) => {
        result.entry[0].dn.should.be.deepEqual(userDN);
      });
  });


});
