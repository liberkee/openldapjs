'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');
const ldif = require('ldif');

const newClient = new LdapClientLib('ldap://localhost:389');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

const entry = [
  {
    attr: 'objectClass',
    vals: ['top', 'person'],
  },
  {
    attr: 'sn',
    vals: ['New User', 'New Name'],
  },
  {
    attr: 'description',
    vals: ['First description', 'Second description', 'Last description'],
  },
];

const postReadControl = {
  oid: 'postread',
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

    return newClient.add(`cn=newUser01,${dn}`, entry);
  })
  .then(() => {
    console.log('The user was add with success');
    return newClient.add(`cn=newUser02,${dn}`, entry, postReadControl);
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
