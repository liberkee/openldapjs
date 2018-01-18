'use strict';

const ldap = require('ldapjs');

const config = require('./../config');

function takeSnap(oldSnap) {

  if (typeof oldSnap === void 0) {
    const t0 = process.hrtime();
    return t0;
  }

  const diff = process.hrtime(oldSnap);
  return diff;
}

function asNanoSeconds(diff) {
  const NS_PER_SEC = 1e9;
  const nanosecs = diff[0] * NS_PER_SEC + diff[1];
  return nanosecs;
}

function asMicroSeconds(diff) {
  const duration = asNanoSeconds(diff);
  return duration / 1e3;
}

function asMilliSeconds(diff) {
  const duration = asNanoSeconds(diff);
  return duration / 1e6;
}

function asSeconds(diff) {
  const duration = asNanoSeconds(diff);
  return duration / 1e9;
}

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
  asNanoSeconds: asNanoSeconds,
  asMicroSeconds: asMicroSeconds,
  asMilliSeconds: asMilliSeconds,
  asSeconds: asSeconds,
  takeSnap: takeSnap,
  bind: bind,
  unbind: unbind,
};
