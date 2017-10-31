'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');
const ldif = require('ldif');

const newClient = new LdapClientLib('ldap://localhost:389');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

const preReadControl = {
  oid: 'preread',
  value: ['entryCSN', 'description'],
  isCritical: true,
};

newClient.initialize()
  .then(() => {
    return newClient.startTLS('/etc/ldap/ca_certs.pem');
  })
  .then(() => {
    return newClient.bind(`cn=cbuta,${dn}`, 'secret');
  })
  .then(() => {

    return newClient.delete(`cn=newUser01,${dn}`);
  })
  .then(() => {
    console.log('The user was deleted with success');
    return newClient.delete(`cn=newUser02,${dn}`, preReadControl);
  })
  .then((result) => {
    const resultJson = ldif.parse(result);
    const outputOptions = {};

    const JSONstructure = resultJson.toObject(outputOptions);
    JSONstructure.entries.forEach((element) => {
      console.log(element);
    });
  })
  .catch((err) => {
    console.log(`${err.name} ${err.constructor.description}`);
  });
