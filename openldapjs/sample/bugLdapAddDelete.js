'use strict';

const LDAPCLIENT = require('../modules/ldapAsyncWrap.js');
const config = require('./configError.json');
const Promise = require('bluebird');
const host = config.ldapAuthentication.host;
const newClient = new LDAPCLIENT(host);
const newClient2 = new LDAPCLIENT(host);

const validEntry = {
  objectClass: config.ldapAdd.objectClass,
  sn: config.ldapAdd.sn,
  description: config.ldapAdd.description,
};

const newEntry = 'cn=newPointChild111';
let dnUser = `${newEntry}${config.ldapAdd.dnNewEntry}`;

return newClient.initialize()
.then(() => {
  return newClient.bind(config.ldapAuthentication.dnAdmin, config.ldapAuthentication.passwordAdmin);
})
.then(() => {
  const add = newClient.add(dnUser, validEntry);

  const delete1 = newClient2.delete(config.ldapDelete.dn);

  return Promise.all([add, delete1]);
})
.then((res) => {
  console.log(`Operation Promise Resorses -> ${res}`);
})
.catch((err) => {
  console.log(`Operation Promise Error -> ${err}`);
})
.then(() => {
  const unbind1 = newClient.unbind();
  const unbind2 = newClient2.unbind();

  return Promise.all([unbind1, unbind2]);
})
.then((res) => {
  console.log(`Unbind Promise Resorses -> ${res}`);
})
.catch((err) => {
  console.log(`Unbind Promise Error -> ${err}`);
});
