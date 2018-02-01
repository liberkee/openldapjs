# LDAP TLS Options

```javascript
    ldap.startTLS(certificatePath)
```
* `certificatePath` Path to a valid CA certificate file to be used for TLS.

A promise returning function that wraps the synchronous `ldap_start_tls_s` C function from the openldap API. It will resolve if TLS has been established or reject otherwise.


## References:

* [Openldap ldap_start_tls_s man page](http://www.openldap.org/software//man.cgi?query=ldap_start_tls&sektion=3&apropos=0&manpath=OpenLDAP+2.4-Release)
* [RFC StartTLS Operation](https://tools.ietf.org/html/rfc4511#section-4.14)