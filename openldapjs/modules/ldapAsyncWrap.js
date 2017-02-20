'use strict';

const client = require('../addonFile/build/Release/binding');
const Promise = require('bluebird');

module.exports = class LDAPWrap {

  initialize(host) {
    return new Promise((resolve, reject) => {
      client.initialize(host, function(err, result) {
        if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  bind(username, password) {
    return new Promise((resolve, reject) => {
      client.authentification(username, password, function(err, result) {
       if(err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}