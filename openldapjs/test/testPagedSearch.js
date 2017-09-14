'use strict';

const should = require('should');
const LDAPWrap = require('../modules/ldapAsyncWrap.js');

const OBJECT_NOT_FOUND = '32';
const ROOT_NODE = '\ndn:\nobjectClass:top\nobjectClass:OpenLDAProotDSE\n\n';

describe('Testing the async LDAP search ', () => {


  const host = 'ldap://localhost:389';
  const dnAdmin = 'cn=admin,dc=demoApp,dc=com';
  const dnUser = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const searchBase = 'dc=demoApp,dc=com';


  const password = 'secret';
  let adminLDAP = new LDAPWrap(host);
  let userLDAP = new LDAPWrap(host);

  beforeEach((next) => {
    adminLDAP = new LDAPWrap(host);
    userLDAP = new LDAPWrap(host);


    adminLDAP.initialize().then(() => {
      adminLDAP.bind(dnAdmin, password).then(() => {
        userLDAP.initialize().then(
            () => { userLDAP.bind(dnUser, password).then(() => { next(); }); });
      });
    });
  });

  afterEach(() => {
    adminLDAP.unbind();
    userLDAP.unbind();

  });

  it('should return an object not found error', (next) => {
    adminLDAP
        .pagedSearch(searchBase, 2, 'objectClass=aliens')
        // .on('err', (err) => { console.log('error is:' + err); })
        .pipe(process.stdout);

    next();
  })



});