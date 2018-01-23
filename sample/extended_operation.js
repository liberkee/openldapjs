'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const config = require('./config.json');

const newClient = new LdapClientLib(config.ldapAuthentication.host);

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

newClient.initialize()
  .then(() => {
    return newClient.startTLS(config.ldapAuthentication.pathFileToCert);
  })
  .then(() => {
    return newClient.bind('cn=admin,dc=demoApp,dc=com', config.ldapAuthentication.passwordUser);
  })
  .then(() => {
    return newClient.extendedOperation('1.3.6.1.4.1.4203.1.11.1',
      ['cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com',
        'secret1',
        'secret']);
  });
