#include "ldap_control.h"
#include <map>
#include <utility>
#include "constants.h"

LdapControls::LdapControls() { mapResult_ = std::make_shared<LDAPMapResult>(); }

std::vector<LDAPControl *> LdapControls::CreateModificationControls(
    const v8::Local<v8::Array> &control_handle) {
  const auto controls_length = control_handle->Length();

  std::vector<LDAPControl *> controlsVector(controls_length);

  for (auto &ctrl : controlsVector) {
    const auto index = &ctrl - &controlsVector[0];
    ctrl = new LDAPControl;

    const auto controls = v8::Local<v8::Object>::Cast(
        control_handle->Get(Nan::New(static_cast<uint32_t>(index))));
    const auto value_controles = v8::Local<v8::Array>::Cast(
        controls->Get(Nan::New(constants::changeValueMember).ToLocalChecked()));
    const auto value_controles_length = value_controles->Length();
    BerElementBuffer berBuffer{};
    BerElement *ber = reinterpret_cast<BerElement *>(&berBuffer);
    std::vector<char *> attributes(value_controles_length);

    for (auto &attr : attributes) {
      const auto index = &attr - &attributes[0];
      Nan::Utf8String modValue(
          value_controles->Get(Nan::New(static_cast<int32_t>(index))));
      attr = strdup(*modValue);
    }
    attributes.push_back(nullptr);

    ber_init2(ber, nullptr, LBER_USE_DER);
    if (ber_printf(ber, "{v}", attributes.data()) == constants::BER_ERROR) {
      return std::vector<LDAPControl *>();
    }

    const auto error =
        ber_flatten2(ber, &ctrl->ldctl_value, constants::BER_ALLOC_FALSE);
    if (error < 0) {
      return std::vector<LDAPControl *>();
    }

    v8::String::Utf8Value controlOperation(
        controls->Get(Nan::New(constants::changeOidMember).ToLocalChecked()));

    if (std::strcmp(*controlOperation, constants::postread) ==
        constants::STR_COMPARE_TRUE) {
      ctrl->ldctl_oid = LDAP_CONTROL_POST_READ;
    } else if (std::strcmp(*controlOperation, constants::preread) ==
               constants::STR_COMPARE_TRUE) {
      ctrl->ldctl_oid = LDAP_CONTROL_PRE_READ;
    } else {
      return std::vector<LDAPControl *>();
    }

    const auto isCritical = v8::Local<v8::Number>::Cast(controls->Get(
        Nan::New(constants::changeIsCriticalMember).ToLocalChecked()));
    ctrl->ldctl_iscritical = static_cast<char>(isCritical->NumberValue());
  }

  return controlsVector;
}

std::string LdapControls::PrintModificationControls(LDAP *ld,
                                                    LDAPMessage *resultMsg) {
  struct berval berValue {};
  BerElement *berElement{};
  LDAPControl **serverControls = nullptr;
  BerVarray vals = nullptr;
  std::string modifyResult{};

  ldap_parse_result(ld, resultMsg, nullptr, nullptr, nullptr, nullptr,
                    &serverControls, constants::FREE_MSG_FALSE);
  int i = 0;
  if (serverControls == nullptr) {
    return modifyResult;
  }
  while (serverControls[i] != nullptr) {
    berElement = ber_init(&serverControls[i]->ldctl_value);
    if (berElement == nullptr) {
      return modifyResult;
    } else if (ber_scanf(berElement, "{m{" /*}}*/, &berValue) == LBER_ERROR) {
      return modifyResult;
    } else {
      mapResult_->GenerateMapEntryDn(berValue.bv_val);

      while (ber_scanf(berElement, "{m" /*}*/, &berValue) != LBER_ERROR) {
        if (ber_scanf(berElement, "[W]", &vals) == LBER_ERROR ||
            vals == nullptr) {
          return modifyResult;
        }
        mapResult_->GenerateMapAttributeBer(berValue.bv_val, vals);
      }
      mapResult_->FillLdifList(mapResult_->GetEntry());
      mapResult_->ClearEntry();
    }
    i++;
  }

  modifyResult = mapResult_->ResultLDIFString();

  ldap_controls_free(serverControls);
  return modifyResult;
}
