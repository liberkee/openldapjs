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
}

#endif  // OPENLDAPJS_LIB_BINDINGS_CONSTANTS_H_
