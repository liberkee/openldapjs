# LDAP Extended Operation

```javascript
    ldap.extendedOperation(oid,values,timeOut);
```

* `oid` The operation OID that is send it for request.
* `values` This parameter is used to provide the specific value for operation. The value can be an Array of elements or just a single element _Optional_
* `timeOut` The maximum amount of time the server should take in responding the add operation (in seconds).. _Optional_

Example usecase:

```javascript
ldap.initialize()
    .then(() => {
        return ldap.extendedOperation(oid,values,timeOut)
    })

```

A promise returning function that wraps the `ldap_extended_operation` C asynchronous function from the openldap API. In Case of success it fulfils with the result from the extended operation function with a result if the operation provide a result or just with a success value. In case of failure, it throws a custom error that can be further inspected for the cause.

The OID that are implemented and tested are: 
* [1.3.6.1.1.8/LDAP Cancel operation](https://tools.ietf.org/html/rfc3909)
* [1.3.6.1.4.1.4203.1.11.1/LDAP Password Modify Operation](https://tools.ietf.org/html/rfc3062)
* [1.3.6.1.4.1.4203.1.11.3/LDAP Who am I Operation](https://tools.ietf.org/html/rfc4532)
* [1.3.6.1.4.1.1466.20037/LDAP StartTLS Operation](https://tools.ietf.org/html/rfc2830)
* [1.3.6.1.4.1.1466.101.119.1/LDAP Refresh Operation](https://tools.ietf.org/html/rfc4533#section-3.8)
Some OID request require extra information and that is given in the value parameter. Because every operation is uniq the value are different and them are need to be construct in a specific way if you want other extended operation fell free to make a pull request with them.    

## References:

* [LDAP Add manpage](https://linux.die.net/man/3/ldap_extended_operation)
* [LDAP Add specs](https://www.ldap.com/the-ldap-extended-operation)