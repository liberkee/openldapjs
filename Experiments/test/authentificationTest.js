'use strict';

const client = require('../addonFile/build/Release/binding');
const should = require('should');

describe('LdapBind#client', () => {

  const host = 'ldap://10.16.0.194:389';

  const authSate = {
    error: 0,
    binded: 2,
  };

  const myClient = new client.LDAPClient();

  beforeEach((next) => {
    myClient.initialize(host);
    next();
  });

  afterEach(() => {
    myClient.unbind();
  });

  it('should bind the client to server', (next) => {
    const bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
    const passwordUser = 'secret';
    const bind = myClient.bind(bindDN, passwordUser);
    should.deepEqual(authSate.binded, bind);
    next();
  });

  it('should fail to bind to the server', (next) => {
    const bindDN = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
    const passwordUser = 'secre';
    const bind = myClient.bind(bindDN, passwordUser);
    should.deepEqual(authSate.error, bind);
    next();
  });

});
