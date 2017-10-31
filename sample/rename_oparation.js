'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');
const ldif = require('ldif');

const newClient = new LdapClientLib('ldap://localhost:389');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';
const newParent = 'ou=template,o=myhost,dc=demoApp,dc=com';

const prePostReadControls = [
  {
    oid: 'postread',
    value: ['entryCSN', 'description'],
    isCritical: true,
  },
  {
    oid: 'preread',
    value: ['entryCSN', 'description'],
    isCritical: true,
  },
];

newClient.initialize()
  .then(() => {
    return newClient.startTLS('/etc/ldap/ca_certs.pem');
  })
  .then(() => {
    return newClient.bind(`cn=cbuta,${dn}`, 'secret');
  })
  .then(() => {

    return newClient.rename(`cn=newUser03,${dn}`, 'cn=newUser03Change', newParent);
  })
  .then(() => {
    console.log('The user was renamed with success');
    return newClient.rename(`cn=newUser04,${dn}`, 'cn=newUser04Change', newParent, prePostReadControls);
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
