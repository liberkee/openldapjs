
import * as LdapClient from './libs/ldap_async_wrap';
import * as errorHandler from './ldapWrapTs/errors/error_dispenser';
import * as errorList from './ldapWrapTs/errors/error_dispenser';

module.exports = {
  Client: LdapClient,
  errorHandler: errorHandler.errorSelection,
  errorList: errorList.errors,
};
