# LDAP Modify Operation

```javascript

    ldap.modify(dn, changes, optionalControls);
```
* `dn` entry that will be modified.
* `changes` Object that contains changes to be made.
* `optionalControls` One or more ldap [Control](../controls.MD). _Optional_
* `timeVal` The maxim amount of time the server should take in responding the modify operation (in seconds). _Optional_

Modify example:

```javascript

const dn = 'cn=newPoint999,o=myhost,dc=demoApp,dc=com';
const preRead = '1.3.6.1.1.13.1';
const postRead = '1.3.6.1.1.13.2';

const changes = {
    op: 'replace', // type of change required, can be either add, replace or delete
    attr: 'sn', // attribute to be modified
    vals: ['New Address, nr 23'] // new value(s)

}

const control = [
    {
        oid: preRead, // oid that identifies the extended op
        value: ['cn'], // array of server response you want before the modify
        isCritical: false, // whether or not the modify should fail if the required response can not be retrieved 
    },
    {
        oid: postRead,
        value: ['objectClass','sn'],
        isCritical: true
    }
]



// init, bind, etc.
//changes the address from the previous value to "New Address,nr 23"
ldap.modify(dn, changes, control)
    .then((result) => {
        console.log(result);
    })



```

## Output

```
dn: cn=newPoint999,o=myhost,dc=demoApp,dc=com
cn:  foo
cn: newPoint999
sn: oldValue

dn: cn=newPoint999,o=myhost,dc=demoApp,dc=com
objectClass: person
sn: New Address, nr 23

```

A promise returning function that wraps the `ldap_modify_ext` asynchronous C function from the openldap API. In case of success, the entry is modified and the promise resolves depending on the controls provided. In case of failure, it the promise rejects with a custom error that can be further inspected.


## References 

* [LDAP Modify man page](https://linux.die.net/man/3/ldap_modify_ext)
* [LDAP Modify specs](https://www.ldap.com/the-ldap-modify-operation)
* [RFC Modify operation](https://tools.ietf.org/html/rfc4511#section-4.6)