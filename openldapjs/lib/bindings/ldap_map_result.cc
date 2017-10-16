#include "ldap_map_result.h"
#include "constants.h"

LDAPMapResult::LDAPMapResult() {}

void LDAPMapResult::GenerateMapEntryDn(const std::string dnEntry) {
  if (!entry_.empty()) {
    LDIFList_.push_back(entry_);
    entry_.clear();
  }
  entry_[counterMap++] = {constants::dn, dnEntry};
}

void LDAPMapResult::GenerateMapAttribute(const std::string attribute,
                                         char **values) {
  for (int i = 0; values[i] != nullptr; i++) {
    entry_[counterMap++] = {attribute, values[i]};
  }
}

void LDAPMapResult::GenerateMapAttributeBer(const std::string attribute,
                                            BerVarray vals) {
  for (int i = 0; vals[i].bv_val != nullptr; i++) {
    entry_[counterMap++] = {attribute, vals[i].bv_val};
  }
}

std::string LDAPMapResult::ResultLDIFString() {
  std::string resultLDIF{};
  for (auto &ldif : LDIFList_) {
    for (auto &ldifEntry : ldif) {
      resultLDIF += constants::newLine;
      resultLDIF += ldifEntry.second.first;
      resultLDIF += constants::separator;
      resultLDIF += ldifEntry.second.second;
    }
    resultLDIF += constants::newLine;
  }
  return resultLDIF;
}

void LDAPMapResult::FillLdifList(
    const std::map<int, std::pair<std::string, std::string>> &entry) {
  LDIFList_.push_back(entry);
}

void LDAPMapResult::ClearEntry() { entry_.clear(); }

std::map<int, std::pair<std::string, std::string>> LDAPMapResult::GetEntry() {
  return entry_;
}
