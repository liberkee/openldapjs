#ifndef OPENLDAPJS_LIB_BINDINGS_CONSTANTS_H_
#define OPENLDAPJS_LIB_BINDINGS_CONSTANTS_H_
#include <iostream>
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
<<<<<<< HEAD

const int LDAP_NOT_FINISHED = 0;  // ldap ext operation not finished yet
=======
const int BER_ALLOC_TRUE = 1;
const int BER_ALLOC_FALSE = 0;
const int BER_ERROR = -1;
const int STR_COMPARE_TRUE = 0;
const int FREE_MSG_FALSE = 0;
const int CONTROL_NO_VAL = 0;
>>>>>>> 65d164a553c6153cda4d131627f07a47af981ec4
}  // namespace constants

#endif  // OPENLDAPJS_LIB_BINDINGS_CONSTANTS_H_
