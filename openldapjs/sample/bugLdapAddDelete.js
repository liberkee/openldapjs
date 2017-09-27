'use strict';

const LDAPCLIENT = require('./sampleLdapWrap.js');
const config = require('./configError.json');
const Promise = require('bluebird');
const host = config.ldapAuthentication.host;
let newClient = new LDAPCLIENT(host);
let newClient2 = new LDAPCLIENT(host);

const validEntry = {
  objectClass: config.ldapAdd.objectClass,
  sn: config.ldapAdd.sn,
  description: config.ldapAdd.description,
};

const newEntry = 'cn=newPointChild111';
let dnUser = `${newEntry}${config.ldapAdd.dnNewEntry}`;
const int1 = newClient2.initialize();
const int2 = newClient.initialize();

Promise.all([int1, int2])
.then(() => {
  const bind1 = newClient.bind(config.ldapAuthentication.dnAdmin, config.ldapAuthentication.passwordAdmin);
  const bind2 = newClient2.bind(config.ldapAuthentication.dnAdmin, config.ldapAuthentication.passwordAdmin);

  return Promise.all([bind1, bind2]);
})
.then(() => {
  const add1 = newClient.add(dnUser, validEntry);
  const add2 = newClient.add(dnUser, validEntry);
  const add3 = newClient.add(dnUser, validEntry);
  const add4 = newClient.add(dnUser, validEntry);
  const add5 = newClient.add(dnUser, validEntry);
  const add6 = newClient.add(dnUser, validEntry);

  const delete1 = newClient2.delete(config.ldapDelete.dn);
  const delete2 = newClient2.delete(config.ldapDelete.dn);
  const delete3 = newClient2.delete(config.ldapDelete.dn);
  const delete4 = newClient2.delete(config.ldapDelete.dn);
  const delete5 = newClient2.delete(config.ldapDelete.dn);
  const delete6 = newClient2.delete(config.ldapDelete.dn);
                  

  return Promise.all([add1, add2, add3, add4, add5, add6, delete1, delete2, delete3 ,delete4, delete5, delete6]);
})
.then((res) => {
  console.log(`Operation Promise Resorses -> ${res}`);
})
.then((res) => {
  console.log(`Unbind Promise Resorses -> ${res}`);
})
.catch((err) => {
  console.log(`Error ------------------> [${err}]`);
})
.then(() => {
  const unbind1 = newClient.unbind();
  const unbind2 = newClient2.unbind();

  return Promise.all([unbind1]);
})
.then((res) => {
  console.log(res);
})
.catch((err) => {
  console.log(`Unbind Error -> ${err}`);
})
