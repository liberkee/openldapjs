'use strict';

const _ = require('underscore');

function takeSnap(oldSnap) {
  if (!_.isArray(oldSnap)) {
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

module.exports = {
  asNanoSeconds: asNanoSeconds,
  asMicroSeconds: asMicroSeconds,
  asMilliSeconds: asMilliSeconds,
  asSeconds: asSeconds,
  takeSnap: takeSnap,
};
