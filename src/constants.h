#ifndef OPENLDAPJS_SRC_CONSTANTS_H_
#define OPENLDAPJS_SRC_CONSTANTS_H_
namespace constants {
const char postread[] = "postread";
const char preread[] = "preread";
const char changeValueMember[] = "value";
const char changeOidMember[] = "oid";
const char changeIsCriticalMember[] = "iscritical";
const int TEN_SECONDS = 10;
const int ONE_SECOND = 1;
const int ZERO_SECONDS = 0;
const int ZERO_USECONDS = 0;
const int ONE_USECOND = 1;
const int ALL_RESULTS = 1;
const int LDAP_ERROR = -1;
const int BIND_STATE = 2;
const int BER_ALLOC_TRUE = 1;
const int BER_ALLOC_FALSE = 0;
const int BER_ERROR = -1;
const int STR_COMPARE_TRUE = 0;
const int FREE_MSG_FALSE = 0;
const int CONTROL_NO_VAL = 0;
const int INVALID_LD = -1;
const int DELETE_OLD_RDN_TRUE = 1;
const int ATTR_WANTED = 0;
const int STRING_EQUAL = 0;
const char dn[] = "dn";
const char separator[] = ": ";
const char newLine[] = "\n";
const int ATTR_VALS_WANTED = 0;
const int NEW_CTX_VAL = 0;
const int LDAP_NOT_FINISHED = 0;  // ldap_ext op not finished yet.
}  // namespace constants

#endif  // OPENLDAPJS_SRC_CONSTANTS_H_
