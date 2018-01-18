'use strict';

const ldap = require('ldapjs');

const config = require('./../config');

function bind(cb) {
  const ldapClient = ldap.createClient({url: config.url});
  ldapClient.bind(config.bindDn, config.password, (err) => {
    if (err) {
      cb(err);
    } else {
      cb(null, ldapClient);
    }
  });
}

function unbind(ldapClient, cb) {
  ldapClient.unbind(cb);
}


module.exports = {
  bind: bind,
  unbind: unbind,
};
