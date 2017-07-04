'use strict'

const MappingJsonToLdif = require('../modules/mappingJsonToLdif.js');
const should = require('should');

describe('Testing Mapping Json to Ldif functionalities', () => {

  let mappingJsonToLdif = new MappingJsonToLdif();
  const jsonOneEntry = {
    entries: [
    {
      operation: 'add',
      modification: {
        type: 'objectClass',
        vals: ['access1', 'access2']
      }
    }
  ]};
const jsonMultipleEntries = {
  entries: [
    {
      operation: 'add',
      modification: {
        type: 'objectClass',
        vals: ['access1', 'access2']
      }
    },
    {
      operation: 'delete',
      modification: {
        type: 'objectClass',
      }
    },
    {
      operation: 'replace',
      modification: {
        type: 'anotherObjectClass',
        vals: ['noAccess1', 'noAccess2']
      }
    }
  ]
}
const emptyJson = {
  entries: []
};
const incorrectOperationJson = {
  entries: [
    {
      operation: 'exchange',
      modification: {
        type: 'objectClass',
        vals: ['access1', 'access2']
      }
    }
  ]
}

  // const for comparing results
  const resJsonOneEntry = [[0, 'objectClass', ['access1', 'access2', 0]]];
  const resJsonMultipleEntry = [[0, 'objectClass', ['access1', 'access2', 0]], 
                                [1, 'objectClass', 0], 
                                [2, 'anotherObjectClass', ['noAccess1', 'noAccess2', 0]]];

  const resEmptyError = 'The passed JSON shall not be empty';
  const resNullError = 'The passed JSON shall not be null or the structure is not as required';
  const resInvOperation = 'The selected operation is invalid';                      

  beforeEach((next) => {
    mappingJsonToLdif = new MappingJsonToLdif();
    next();
  });

  afterEach(() => {

  });

  it ('should map a JSON with a single entry', (next) => {
    mappingJsonToLdif.modifyToLdif(jsonOneEntry)
    .then((result) => {
      should.deepEqual(result, resJsonOneEntry);
      next();
    })
    .catch((err) => {
      console.log(err);
    })
  });

  it ('should map a JSON with a multiple entries', (next) => {
    mappingJsonToLdif.modifyToLdif(jsonMultipleEntries)
    .then((result) => {
      should.deepEqual(result, resJsonMultipleEntry);
      next();
    });
  });

  it ('should handle error if the JSON is empty', (next) => {
    mappingJsonToLdif.modifyToLdif(emptyJson)
    .catch((err) => {
      should.deepEqual(err.message, resEmptyError);
      next();
    });
  });

  it ('should handle error if the JSON is null', (next) => {
    mappingJsonToLdif.modifyToLdif(null)
    .catch((err) => {
      should.deepEqual(err.message, resNullError);
      next();
    });
  });

  it ('should handle error if the JSON hass a different structure', (next) => {
    mappingJsonToLdif.modifyToLdif(null)
    .catch((err) => {
      should.deepEqual(err.message, resNullError);
      next();
    });
  });

    it ('should handle error if operation is incorrect', (next) => {
    mappingJsonToLdif.modifyToLdif(incorrectOperationJson)
    .catch((err) => {
      should.deepEqual(err.message, resInvOperation);
      next();
    });
  });

});
