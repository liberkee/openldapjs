'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');
const config = require('./config');
const Promise = require('bluebird');
const errList = require('./errorlist.json');

describe.only('Testing the async LDAP search ', () => {

  const host = config.ldapAuthentication.host;
  const dnAdmin = config.ldapAuthentication.dnAdmin;
  const dnUser = config.ldapAuthentication.dnUser;
  const searchBase = config.ldapSearch.searchBase;
  const searchBaseUser = config.ldapSearch.searchBaseUser;


  const password = config.ldapAuthentication.passwordAdmin;
  let adminLDAP = new LDAPWrap(host);
  let userLDAP = new LDAPWrap(host);
  let pagedSearchPromise;

  const pageSize = 10;

  const searchScope = {
    base: 'BASE',
    one: 'ONE',
    subtree: 'SUBTREE',
  };

  beforeEach(() => {
    adminLDAP = new LDAPWrap(host);
    userLDAP = new LDAPWrap(host);

    const init1 = adminLDAP.initialize();
    const init2 = userLDAP.initialize();

    return Promise.all([init1, init2])
      .then(() => {
        const bind1 = adminLDAP.bind(dnAdmin, password);
        const bind2 = userLDAP.bind(dnUser, password);

        return Promise.all([bind1, bind2]);
      })
      .then(() => {
        pagedSearchPromise = Promise.promisifyAll(adminLDAP);
      });
  });

  afterEach(() => {
    const unbind1 = adminLDAP.unbind();

    return Promise.all([unbind1]);
  });

  it('should reject if the state of client is not BOUND', () => {
    return adminLDAP.unbind()
      .then(() => {
        return pagedSearchPromise.pagedSearchAsync(searchBase, searchScope.subtree,
          config.ldapSearch.filterObjSpecific, pageSize);
      })
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        err.message.should.deepEqual(errList.bindErrorMessage);
      });
  });

  it('should reject if searchBase is not string type', () => {
    return pagedSearchPromise.pagedSearchAsync(1, searchScope.subtree,
      config.ldapSearch.filterObjSpecific, pageSize)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        err.message.should.deepEqual(errList.typeErrorMessage);
      });
  });

  it('should reject if scope is not string type', () => {
    return pagedSearchPromise.pagedSearchAsync(
      searchBase, 1, config.ldapSearch.filterObjSpecific, pageSize)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        err.message.should.deepEqual(errList.typeErrorMessage);
      });
  });

  it('should reject if searchFilter is not string type', () => {
    return pagedSearchPromise.pagedSearchAsync(
      searchBase, searchScope.subtree, 1, pageSize)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        err.message.should.deepEqual(errList.typeErrorMessage);
      });
  });

  it('should reject if pageSize is not integer type', () => {
    return pagedSearchPromise.pagedSearchAsync(
      searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific,
      '20')
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        err.message.should.deepEqual(errList.typeErrorIntMessage);
      });
  });

  it('should reject if scope parameter doesn\'t exist', () => {
    return pagedSearchPromise.pagedSearchAsync(
      searchBase, 'noScope', config.ldapSearch.filterObjSpecific, pageSize)
      .then(() => {
        should.fail('Didn\'t expect success');
      })
      .catch((err) => {
        err.message.should.deepEqual(errList.scopeSearchError);
      });
  });

  it('should reject if filter is not defined correctly ', (next) => {
    const resultPage = adminLDAP.pagedSearch(
      searchBase, searchScope.subtree, 'aasd', pageSize);

    resultPage.on('data', (data) => {
      should.fail('Didn\'t expect success');
    });

    resultPage.on('err', (err) => {
      err.should.deepEqual(errList.filterError);
    });

    resultPage.on('end', () => {
      next();
    });
  });

  it('should reject if searchBase is not an entry in ldap', (next) => {
    const resultPage = adminLDAP.pagedSearch(
      'dc=notEntry,dc=com', searchScope.subtree, config.ldapSearch.filterObjSpecific, pageSize);

    resultPage.on('data', (data) => {
      should.fail('Didn\'t expect success');
    });

    resultPage.on('err', (err) => {
      err.should.deepEqual(errList.ldapNoSuchObject);
    });

    resultPage.on('end', () => {
      next();
    });
  });

  it('should reject if user doesn\'t have the right to read on that entryDN', (next) => {
    const resultPage = userLDAP.pagedSearch(
      searchBase, searchScope.subtree, config.ldapSearch.filterObjSpecific,
      pageSize);


    resultPage.on('data', (data) => {
      should.fail('Didn\'t expect success');
    });

    resultPage.on('err', (err) => {
      err.should.deepEqual(errList.ldapNoSuchObject);
    });

    resultPage.on('end', () => {
      next();
    });
  });

  it('should reject if the size of page is bigger then the size limit defined on server', (next) => {
    /* On our server the page size is not set and is default on 500 entries */
    const newPageSize = 1000;

    const resultPage = userLDAP.pagedSearch(searchBaseUser, searchScope.subtree,
      config.ldapSearch.filterObjAll, newPageSize);

    resultPage.on('data', (data) => {
      should.fail('Didn\'t expect success');
    });

    resultPage.on('err', (err) => {
      err.should.deepEqual(errList.sizeLimitExceeded);
    });

    resultPage.on('end', () => {
      next();
    });
  });

  it('should return search results with pagesize 10', function pageSearchTime(next) {
    this.timeout(0);
    let numberPage = 0;
    /* Our LDAP database have ~50k entries */
    const resultPage = adminLDAP.pagedSearch(searchBase, searchScope.subtree,
      config.ldapSearch.filterObjAll, pageSize);

    resultPage.on('data', (data) => {
      numberPage += 1;
    });

    resultPage.on('end', () => {
      numberPage.should.be.above(5000);
      next();
    });

  });


});
