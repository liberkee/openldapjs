'use strict';

const client = require('../addonFile/build/Release/binding');
const should = require('should');
const LDAPWrap = require('../modules/ldapWrap');

describe('Testing the State Machine of the Client', () => {

  const host = 'ldap://10.16.0.194:389';
  const dn = 'cn=rmaxim,ou=users,o=myhost,dc=demoApp,dc=com';
  const password = 'secret';
  
  const E_STATES = {
      CREATED: 0,
      INITIALIZED: 1,
      BOUND: 2,
      UNBOUND: 5,
    };

  beforeEach((next) => {
    next();
  });

  afterEach(() => {
  });

  it('should be the state = CREATED', (next) => {
    const ldapWrap = new LDAPWrap(host, dn, password);
    
    should.deepEqual(ldapWrap.config, E_STATES.CREATED);
    next();
  });

  it('should be the state = INITIALIZED', (next) => {
    const ldapWrap = new LDAPWrap(host, dn, password);

    ldapWrap.initialize()
    .then(() => {
      should.deepEqual(ldapWrap.config, E_STATES.INITIALIZED);
      next();
    });
  });

  it('should not Initialize if the host is wrong', (next) => {
    const wrongHost = 'abcd';
    const ldapWrap = new LDAPWrap(wrongHost, dn, password);

    ldapWrap.initialize()
    .catch((error) => {
      should.deepEqual(error.message, 'The initialization failed');
      should.notDeepEqual(ldapWrap.config, E_STATES.INITIALIZED);
      next();
    });
  });

  it('should be the state = BOUND', (next) => {
    const ldapWrap = new LDAPWrap(host, dn, password);

    ldapWrap.initialize()
    .then(() => {
      ldapWrap.bind()
      .then(() => {
        should.deepEqual(ldapWrap.config, E_STATES.BOUND);
        next();
      })
    });
  });

  it('should not bind if the state is not initialized', (next) => {
    const ldapWrap = new LDAPWrap(host, dn, password);

    ldapWrap.bind()
    .catch((error) => {
      should.deepEqual(error.message, 'The bind operation failed. It could be done if the state of the client is Initialized');
      should.notDeepEqual(ldapWrap.config, E_STATES.BOUND);
      next();
    });
  });

  it('should not bind if the dn is wrong', (next) => {
    const wrongDn = 'abcd';
    const ldapWrap = new LDAPWrap(host, wrongDn, password);

    ldapWrap.initialize()
    .then(() => {
      ldapWrap.bind()
      .catch((error) => {
        should.deepEqual(error.message, 'The binding failed');
        should.notDeepEqual(ldapWrap.config, E_STATES.BOUND);
        next();
      })
    })
  });

  it('should not bind if the password is wrong', (next) => {
    const wrongPassword = 'abcd';
    const ldapWrap = new LDAPWrap(host, dn, wrongPassword);

    ldapWrap.initialize()
    .then(() => {
      ldapWrap.bind()
      .catch((error) => {
        should.deepEqual(error.message, 'The binding failed');
        should.notDeepEqual(ldapWrap.config, E_STATES.BOUND);
        next();
      })
    })
  });


  it('should be the state = UNBOUND', (next) => {
    const ldapWrap = new LDAPWrap(host, dn, password);

    ldapWrap.initialize()
    .then(() => {
      ldapWrap.bind()
      .then(() => {
        ldapWrap.unbind()
        .then(() => {
          should.deepEqual(ldapWrap.config, E_STATES.UNBOUND);
          next();
        })
      })
    })
  });

  
  it('should not unbind if the state is not BOUND', (next) => {
    const ldapWrap = new LDAPWrap(host, dn, password);

    ldapWrap.initialize()
    .then(() => {
      ldapWrap.unbind()
      .catch((error) => {
        should.notDeepEqual(ldapWrap.config, E_STATES.UNBOUND);
        should.deepEqual(error.message, 'Binding shall be done before unbinding');
        next();
      })
    })
  });  

  it('should set the value for the config', (next) => {
    const ldapWrap = new LDAPWrap(host, dn, password);
    const dummyState = 'state';

    ldapWrap.config = dummyState;
    should.deepEqual(ldapWrap.config, dummyState);

    next();
  });  

});
