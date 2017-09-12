'use strict';

const should = require('should');

// Require the library that is used for the test
const JSONmap = require('../modules/mappingJsonObject/mappingStringJson.js');

describe('String to JSON#searchTest', () => {
  const JSONStruct = new JSONmap();
  let simpleLdif =
      '\ndn:ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:organizationalUnit\nou:users';
  let doubleAttrLdif =
      '\ndn:ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:organizationalUnit\nobjectClass:organizationalUnit\nou:users';
  let mixedAttrLdif =
      '\ndn:ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:organizationalUnit\nou:users\nobjectClass:userUnit';
  let mixedDoubledAttrLdif =
      '\ndn:ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:organizationalUnit1\nou:users1\nobjectClass:organizationalUnit2\nou:users2';
  let moreObjLdif =
      '\ndn:ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:organizationalUnit1\nou:users1\n\ndn:ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:organizationalUnit2\nou:users2';
  let noValueLdif =
      '\ndn:ou=users,o=myhost,dc=demoApp,dc=com\nobjectClass:organizationalUnit\nou:\nobjectClass:userUnit';
  let noAttrLdif = '\ndn:ou=users,o=myhost,dc=demoApp,dc=com';
  let noDnLdif = '\nobjectClass:organizationalUnit\nou:\nobjectClass:userUnit';
  let emptyDnLdif = '\ndn:\nobjectClass:organizationalUnit\nou:users';

  beforeEach((next) => { next(); });

  afterEach(() => {});

  it('should return the string as JSON', (next) => {
    JSONStruct.stringLDAPtoJSON(simpleLdif).then((result) => {
      const JSONobjecttest = [{
        dn: 'ou=users,o=myhost,dc=demoApp,dc=com',
        attribute: [
          {type: 'objectClass', value: ['organizationalUnit']},
          {type: 'ou', value: ['users']},
        ],
      }];
      const shouldString = JSON.stringify(JSONobjecttest[0]);
      const resultString = JSON.stringify(result.entry[0]);

      should.equal(shouldString, resultString);
      next();
    });
  });

  it('should return the string as JSON from a ldif with double attribute',
     (next) => {
       JSONStruct.stringLDAPtoJSON(doubleAttrLdif).then((result) => {
         const JSONobjecttest = [{
           dn: 'ou=users,o=myhost,dc=demoApp,dc=com',
           attribute: [
             {
               type: 'objectClass',
               value: ['organizationalUnit', 'organizationalUnit']
             },
             {type: 'ou', value: ['users']},
           ],
         }];
         const shouldString = JSON.stringify(JSONobjecttest[0]);
         const resultString = JSON.stringify(result.entry[0]);

         should.equal(shouldString, resultString);
         next();
       });
     });


  it('should return the string as JSON from a ldif with mixed up attribute',
     (next) => {
       JSONStruct.stringLDAPtoJSON(mixedAttrLdif).then((result) => {
         const JSONobjecttest = [{
           dn: 'ou=users,o=myhost,dc=demoApp,dc=com',
           attribute: [
             {type: 'objectClass', value: ['organizationalUnit', 'userUnit']},
             {type: 'ou', value: ['users']},
           ],
         }];
         const shouldString = JSON.stringify(JSONobjecttest[0]);
         const resultString = JSON.stringify(result.entry[0]);

         should.equal(shouldString, resultString);
         next();
       });
     });


  it('should return the string as JSON from a ldif with 2 objects', (next) => {
    JSONStruct.stringLDAPtoJSON(moreObjLdif).then((result) => {
      const JSONobjecttest = [
        {
          dn: 'ou=users,o=myhost,dc=demoApp,dc=com',
          attribute: [
            {type: 'objectClass', value: ['organizationalUnit1']},
            {type: 'ou', value: ['users1']},
          ],
        },
        {
          dn: 'ou=users,o=myhost,dc=demoApp,dc=com',
          attribute: [
            {type: 'objectClass', value: ['organizationalUnit2']},
            {type: 'ou', value: ['users2']},
          ],
        }
      ];
      const shouldString0 = JSON.stringify(JSONobjecttest[0]);
      const shouldString1 = JSON.stringify(JSONobjecttest[1]);

      const resultString0 = JSON.stringify(result.entry[0]);
      const resultString1 = JSON.stringify(result.entry[1]);

      should.equal(shouldString0, resultString0);
      should.equal(shouldString1, resultString1);
      next();
    });
  });

  it('should return the string as JSON from a ldif with mixed up doubled attribute',
     (next) => {
       JSONStruct.stringLDAPtoJSON(mixedDoubledAttrLdif).then((result) => {
         const JSONobjecttest = [{
           dn: 'ou=users,o=myhost,dc=demoApp,dc=com',
           attribute: [
             {
               type: 'objectClass',
               value: ['organizationalUnit1', 'organizationalUnit2']
             },
             {type: 'ou', value: ['users1', 'users2']},
           ],
         }];
         const shouldString = JSON.stringify(JSONobjecttest[0]);
         const resultString = JSON.stringify(result.entry[0]);

         should.equal(shouldString, resultString);
         next();
       });
     });

  it('should return an error if an attribute does not have a value', (next) => {
    JSONStruct.stringLDAPtoJSON(noValueLdif).catch((err) => {
      should.deepEqual(err.message, 'The string is not a LDAP structure');
      next();
    });
  });

  it('should return an error if the ldif does not have any attributes',
     (next) => {
       JSONStruct.stringLDAPtoJSON(noAttrLdif).catch((err) => {
         should.deepEqual(err.message, 'The string is not a LDAP structure');
         next();
       });
     });

  it('should return an error if the dn is missing', (next) => {
    JSONStruct.stringLDAPtoJSON(noDnLdif).catch((err) => {
      should.deepEqual(err.message, 'The string is not a LDAP structure');
      next();
    });
  });

  it('should return an error if the dn has no value', (next) => {
    JSONStruct.stringLDAPtoJSON(emptyDnLdif).catch((err) => {
      should.deepEqual(err.message, 'The string is not a LDAP structure');
      next();
    });
  });


  it('should return an error if there is a number', (next) => {
    JSONStruct.stringLDAPtoJSON(1234).catch((err) => {
      should.deepEqual(err.message, 'Must be a string');
      next();
    });
  });

  it('should return an error if string is null', (next) => {
    JSONStruct.stringLDAPtoJSON(null).catch((err) => {
      should.deepEqual(err.message, 'The string is null');
      next();
    });
  });

  it('should return an error if string is undefined', (next) => {
    JSONStruct.stringLDAPtoJSON(undefined).catch((err) => {
      should.deepEqual(err.message, 'The string is undefined');
      next();
    });
  });

  it('should return an error if string is empty', (next) => {
    JSONStruct.stringLDAPtoJSON('').catch((err) => {
      should.deepEqual(err.message, 'The string is empty');
      next();
    });
  });

  it('should return an error if is not a LDIF structure', (next) => {
    JSONStruct.stringLDAPtoJSON('A string').catch((err) => {
      should.deepEqual(err.message, 'The string is not a LDAP structure');
      next();
    });
  });

});
