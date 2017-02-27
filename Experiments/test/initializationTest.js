'use strict';

const client = require('../addonFile/build/Release/binding');
const should = require('should');

const initState = {
  error: 0,
  initialized: 1,
};

describe('LdapInitialization#client', () => {

  const initState = {
    error: 0,
    initialized: 1,
  };

  const myClient = new client.LDAPClient();

  afterEach(() => {
    myClient.unbind();
  });

  it('should initialized the client structure', (next) => {
    const host = 'ldap://10.16.0.194:389';
    const init = myClient.initialize(host);

    should.deepEqual(initState.initialized, init);
    next();
  });

  it('should fail if host is incorect', (next) => {
    const notGoodHost = '10.16.0.193:388';
    const init = myClient.initialize(notGoodHost);
    should.deepEqual(initState.error, init);
    next();
  });
});
