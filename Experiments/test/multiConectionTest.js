'use strict';

//Import the addon function and openLdap libraries
const client = require('../addonFile/build/Release/binding');

describe('LdapMultiConection#client', () => {

  const host = 'ldap://10.16.0.194:389';

  const userDNclient1 = 'cn=cbuta,ou=users,o=myhost,dc=demoApp,dc=com';
  const userPassclient1 = 'secret';
  const userDNclient2 = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
  const userPassclient2 = 'secret';

  const searchBase = 'ou=users,o=myhost,dc=demoApp,dc=com';
  const searchFilter = '(objectclass=person)';
  const scope = 2;


  const myClient1 = new client.LDAPClient();
  const myClient2 = new client.LDAPClient();

  beforeEach((next) => {

    myClient1.initialize(host);
    myClient1.bind(userDNclient1, userPassclient1);

    myClient2.initialize(host);
    myClient2.bind(userDNclient2, userPassclient2);

    next();
  });

  afterEach(() => {
    myClient1.unbind();
    myClient2.unbind();
  });

  it('should return the search of client\'s', (next) => {
    const firstClient = myClient1.search(searchBase, scope, searchFilter);
    const secondClient = myClient2.search(searchBase, scope, searchFilter);

    firstClient.should.not.equal(secondClient);
    next();
  });
});
