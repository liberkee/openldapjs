# LDAP Controls


Some LDAP functions accept optional `control` parameters. These allow for extended functionalities in addition to the regular ones.

Currently this library only supports pre and post read controls for the [Add](./ldap_functions/add.MD), [Delete](./ldap_functions/delete.MD), [Modify](./ldap_functions/modify.MD) and [Rename](./ldap_functions/rename.MD) functions. By specifying pre/postread controls, the return value can contain extra data depending on what the control parameters are.

Note: One or more controls can pe specified.

Examples:

```javascript

/* a control array that will attempt to retrieve the entryCSN and entryUUID before the operation is executed, but will move forward if it fails to and after the operation is done it will get the entryCSN and entryUUID OR it returns an error */
const controlArray = [
  {
    oid: 'postread', // control type
    value: ['entryCSN', 'entryUUID'], // what attributes to return
    isCritical: false, // this means that the operation won't fail if the values can't be retrieved
  },
  {
    oid: 'preread',
    value: ['entryCSN', 'entryUUID'],
    isCritical: true,
  },
];

const what = 'cn=testUser2,cn=newPoint,ou=users,o=myhost,dc=demoApp,dc=com';

// array of attributes to be modified
const how = [
  {
    op: 'replace', // type of modification. replace,delete or add
    attr: 'description', // what attribute to modify
    vals: ['replacement1', 'replacement#2'],
  },
];


ldapClient.initialize()
  .then(() => {
    return ldapClient.bind('cn=admin,dc=demoApp,dc=com', 'secret');
  })
  .then(() => {
    return ldapClient.modify(what, how, controlArray);
  })
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });

```

Output:
```
dn: cn=testUser2,cn=newPoint,ou=users,o=myhost,dc=demoApp,dc=com
entryUUID: 900fc5b2-6d3e-1037-98a8-df2501b77335
entryCSN: 20171204125826.643870Z#000000#000#000000

dn: cn=testUser2,cn=newPoint,ou=users,o=myhost,dc=demoApp,dc=com
entryUUID: 900fc5b2-6d3e-1037-98a8-df2501b77335
entryCSN: 20171207143939.032387Z#000000#000#000000
```

This works similarly for the other functionalities that support optional control parameters.

Note: LDAP supports a plethora of controls defined by their OID. This library currently supports just the pre and post read controls.

## References

* [LDAP control man page](https://linux.die.net/man/3/ldap_controls) 
* [LDAP control specs](https://www.ldap.com/basic-ldap-concepts#Controls)
* [RFC controls](https://tools.ietf.org/html/rfc4511#section-4.1.11)