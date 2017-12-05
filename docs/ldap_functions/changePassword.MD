# LDAP Change Password Operation

```javascript
    ldap.changePassword(user, oldPassword, newPassword)
```

* `user` dn of the user whose password will be changed. E.G: `cn=user1,ou=users,dc=example,dc=com`.
* `oldPassword` old/current password of `user`
* `newPassword` new password.

A promise returning function that wraps the `ldap_paswd` C function from the openldap API. In case of success, it fulfils and changes the password of the given user. In case of failure, it throws a custom error that can be further inspected for the cause.


## References:

* [Nan Add Wrapper](../../src/binding.cc) & [AsyncProgress Worker](../../src/ldap_changePassword_progress.cc)
* [Javascript Source Code](../../libs/ldap_async_wrap.js)
