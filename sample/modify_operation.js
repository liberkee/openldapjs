'use strict';

const LdapClientLib = require('../libs/ldap_async_wrap.js');

const newClient = new LdapClientLib('ldap://localhost:389');
const ldif = require('ldif');

const dn = 'ou=users,o=myhost,dc=demoApp,dc=com';

const changes = [
  {
    op: 'add',
    attr: 'telephoneNumber',
    vals: ['0744429'],
  },
  {
    op: 'delete',
    attr: 'description',
    vals: ['First description', 'Second description'],
  },
  {
    op: 'replace',
    attr: 'sn',
    vals: ['User New Name'],
  },
];

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

    return newClient.modify(`cn=newUser01,${dn}`, changes);
  })
  .then(() => {
    console.log('The user was modify with success');
    return newClient.modify(`cn=newUser02,${dn}`, changes, prePostReadControls);
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
