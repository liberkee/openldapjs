'use strict';

const Client = require('../../index.js').Client;

const config = require('./../config');

const ldapClient = new Client(config.url);

function bind(cb) {
  return ldapClient.initialize()
    .then(() => {
      return ldapClient.bind(config.bindDn, config.password);
    })
    .then(() => {
      return ldapClient;
    })
    .asCallback(cb);
}

function unbind(cb) {
  return ldapClient.unbind()
    .asCallback(cb);
}

module.exports = {
  bind: bind,
  unbind: unbind,
};
