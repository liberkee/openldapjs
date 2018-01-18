'use strict';

const ldap = require('ldapjs');

const config = require('./../config');
let sharedClient = null;

function bind(cb) {
  sharedClient = ldap.createClient({url: config.url});
  sharedClient.bind(config.bindDn, config.password, (err) => {
    if (err) {
      cb(err);
    } else {
      cb(null, sharedClient);
    }
  });
}

function fatalUnbind() {
  sharedClient.unbind(() => {
    process.exit(1);
  });
}

function unbind(ldapClient, cb) {
  if (ldapClient === null || ldapClient === void 0 || typeof ldapClient === 'Function') {
    fatalUnbind();
  } else {
    ldapClient.unbind(cb);
  }
}

module.exports = {
  bind: bind,
  unbind: unbind,
};
