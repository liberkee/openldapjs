# LDAP Extended Operation

```javascript
    ldap.extendedOperation(oid,values,timeOut);
```

* `oid` The operation ID that is sent. This maps to a specific extended operation.
* `values` This parameter is used to provide the specific value for operation. It  can be an Array of elements or just a single element _Optional_
* `timeOut` The maximum amount of time the server should take in responding to the request (in seconds).. _Optional_

Example use case:

```javascript
ldap.initialize()
    .then(() => {
        return ldap.extendedOperation(oid,values,timeOut)
    })

```

A promise returning function that wraps the `ldap_extended_operation` C asynchronous function from the openldap API. In Case of success it fulfils with the result from the extended operation function, if the operation provides a result, or just with a success value(0). In case of failure, it throws a custom error that can be further inspected for the cause.

The OIDs that are implemented and tested are: 
* [1.3.6.1.1.8/LDAP Cancel operation](https://tools.ietf.org/html/rfc3909)
* [1.3.6.1.4.1.4203.1.11.1/LDAP Password Modify Operation](https://tools.ietf.org/html/rfc3062)
* [1.3.6.1.4.1.4203.1.11.3/LDAP Who am I Operation](https://tools.ietf.org/html/rfc4532)
* [1.3.6.1.4.1.1466.20037/LDAP StartTLS Operation](https://tools.ietf.org/html/rfc2830)
* [1.3.6.1.4.1.1466.101.119.1/LDAP Refresh Operation](https://tools.ietf.org/html/rfc4533#section-3.8)

Some OID requests require extra information that is provided  in the `value` parameter. Values are usually specific to each extended op, for now this library supports just the ones mentioned above.
## References:

* [LDAP Add manpage](https://linux.die.net/man/3/ldap_extended_operation)
* [LDAP Add specs](https://www.ldap.com/the-ldap-extended-operation)