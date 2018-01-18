#!/usr/bin/env node

'use strict';

const os = require('os');
const cp = require('child_process');

const _ = require('underscore');

const gShared = require('./global_shared');
const config = require('./config');

const rawIterations = 10;

const ldapjsCommands = [
  {
    name: 'add',
    cmd: 'node ldapjs/ldap_add_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'compare',
    cmd: 'node ldapjs/ldap_compare_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'modify',
    cmd: 'node ldapjs/ldap_modify_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'search',
    cmd: 'node ldapjs/ldap_search_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'delete',
    cmd: 'node ldapjs/ldap_delete_series.js',
    durations: [],
    sum: 0,
  },
];

const openldapjsCommands = [
  {
    name: 'add',
    cmd: 'node openldapjs/openldap_add_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'compare',
    cmd: 'node openldapjs/openldap_compare_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'modify',
    cmd: 'node openldapjs/openldap_modify_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'search',
    cmd: 'node openldapjs/openldap_search_series.js',
    durations: [],
    sum: 0,
  }, {
    name: 'delete',
    cmd: 'node openldapjs/openldap_delete_series.js',
    durations: [],
    sum: 0,
  },
];

function proc(obj) {
  const begin = process.hrtime();
  cp.execSync(obj.cmd, {cwd: __dirname});
  const end = gShared.takeSnap(begin);
  obj.durations.push(gShared.asSeconds(end));
  obj.sum += gShared.asSeconds(end);
}

function avg(list) {
  let sum = 0;
  _.each(list, (element) => {
    sum += element;
  });

  return sum / list.length;
}

function report(commandList) {
  _.each(commandList, (command) => {
    console.log(`## ${command.name} ##`);
    console.log(`sum:     ${command.sum} s`);
    console.log(`slowest: ${_.max(command.durations)} s`);
    console.log(`fastest: ${_.min(command.durations)} s`);
    console.log(`average: ${avg(command.durations)} s`);
  });
}

function performBenching(commandList, name) {
  console.log(`Running ${name} for ${rawIterations} iterations and ${config.entryCount} entries:`);
  for (let i = 0; i < rawIterations; i++) {
    _.each(commandList, (commandList) => {
      proc(commandList);
    });
  }
  report(commandList);
}

performBenching(ldapjsCommands, 'ldapjs');
console.log(os.EOL);
performBenching(openldapjsCommands, 'openldapjs');
