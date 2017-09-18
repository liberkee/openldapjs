#include "ldap_control.h"
#include "constants.h"

LdapControls::LdapControls() {}

std::vector<LDAPControl *> LdapControls::CreateModificationControls(
    const v8::Local<v8::Array> &control_handle) {
  const auto controls_length = control_handle->Length();

  std::vector<LDAPControl *> ctrls(controls_length);

  for (auto &ctrl : ctrls) {
    const auto index = &ctrl - &ctrls[0];
    ctrl = new LDAPControl;

    const auto controls = v8::Local<v8::Object>::Cast(
        control_handle->Get(Nan::New(static_cast<uint>(index))));
    const auto value_controles = v8::Local<v8::Array>::Cast(
        controls->Get(Nan::New(constants::changeValueMember).ToLocalChecked()));
    int value_controles_length = value_controles->Length();
    BerElementBuffer berbuf{};
    BerElement *ber = (BerElement *)&berbuf;
    std::vector<char *> attrs(value_controles_length);

    for (auto &attr : attrs) {
      const auto index = &attr - &attrs[0];
      Nan::Utf8String modValue(
          value_controles->Get(Nan::New(static_cast<int>(index))));
      attr = strdup(*modValue);
    }
    attrs.push_back(nullptr);

    ber_init2(ber, nullptr, LBER_USE_DER);
    if (ber_printf(ber, "{v}", attrs.data()) == -1) {
      return std::vector<LDAPControl *>();
    }

    const auto error = ber_flatten2(ber, &ctrl->ldctl_value, 0);
    if (error < 0) {
      return std::vector<LDAPControl *>();
    }

    v8::String::Utf8Value controlOperation(
        controls->Get(Nan::New(constants::changeOidMember).ToLocalChecked()));

    if (std::strcmp(*controlOperation, constants::postread) == 0) {
      ctrl->ldctl_oid = reinterpret_cast<const char *>(LDAP_CONTROL_POST_READ);  //  compiler warning though...
    } else if (std::strcmp(*controlOperation, constants::preread) == 0) {
      ctrl->ldctl_oid = reinterpret_cast<const char *>(LDAP_CONTROL_PRE_READ);
    } else {
      return std::vector<LDAPControl *>();
    }

    auto isCritical = v8::Local<v8::Number>::Cast(controls->Get(
        Nan::New(constants::changeIsCriticalMember).ToLocalChecked()));
    int isC = isCritical->NumberValue();
    ctrl->ldctl_iscritical = isC;
  }

  return ctrls;
}

std::string LdapControls::PrintModificationControls(LDAP *ld,
                                                    LDAPMessage *resultMsg) {
  struct berval bv{};
  BerElement *ber{};
  LDAPControl **serverCTL = nullptr;
  BerVarray vals = nullptr;
  std::string modifyResult{};

  ldap_parse_result(ld, resultMsg, nullptr, nullptr, nullptr, nullptr,
                    &serverCTL, 0);
  auto i = 0;

  if (serverCTL == nullptr) {
    return modifyResult;
  }
  while (serverCTL[i] != 0) {
    ber = ber_init(&serverCTL[i]->ldctl_value);
    if (ber == nullptr) {
      return modifyResult;
    } else if (ber_scanf(ber, "{m{" /*}}*/, &bv) == LBER_ERROR) {
      return modifyResult;
    } else {
      modifyResult += "\n";
      modifyResult += "dn: ";
      modifyResult += bv.bv_val;
      while (ber_scanf(ber, "{m" /*}*/, &bv) != LBER_ERROR) {
        if (ber_scanf(ber, "[W]", &vals) == LBER_ERROR || vals == nullptr) {
          modifyResult = "";
          return modifyResult;
        }
        auto j = 0;
        while (vals[j].bv_val != NULL) {
          modifyResult += "\n";
          modifyResult += bv.bv_val;
          modifyResult += ": ";
          modifyResult += vals[j].bv_val;
          j++;
        }
      }
      modifyResult += "\n";
    }
    i++;
  }
  ldap_controls_free(serverCTL);
  return modifyResult;
}
