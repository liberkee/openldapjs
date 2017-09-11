#include "ldap_control.h"
#include "constants.h"
LdapControls::LdapControls()
{

}

std::vector<LDAPControl *> LdapControls::CreateModificationControls(const v8::Local<v8::Array> &control_handle) {
  const auto controls_length = control_handle->Length();

  std::vector<LDAPControl*> ctrls(controls_length);

  for(auto& ctrl : ctrls) {
    const auto index = &ctrl - &ctrls[0];
    ctrl = new LDAPControl;

    const auto controls = v8::Local<v8::Object>::Cast(control_handle->Get(Nan::New(static_cast<uint>(index))));
    const auto value_controles = v8::Local<v8::Array>::Cast(controls->Get(Nan::New("value").ToLocalChecked()));
    int value_controles_length = value_controles->Length();
    BerElementBuffer berbuf;
    BerElement *ber = (BerElement *)&berbuf;
    std::vector<char*> attrs(value_controles_length);

    for (auto& attr : attrs) {
      const auto index = &attr - &attrs[0];
      Nan::Utf8String modValue(value_controles->Get(Nan::New(static_cast<int>(index))));
      attr = strdup(*modValue);
    }
    attrs.push_back(NULL);

    ber_init2(ber, NULL, LBER_USE_DER);
    if(ber_printf(ber, "{v}", attrs.data()) == -1) {
      std::cout << "preread attrs encode failed. \n" << std::endl;
      return std::vector<LDAPControl *>();
    }

    const auto error = ber_flatten2(ber, &ctrl->ldctl_value, 0);
    if (error < 0) {
      std::cout << "preread flatten failed" << std::endl;
      return std::vector<LDAPControl *>();
    }

    v8::String::Utf8Value controlOperation(controls->Get(Nan::New("oid").ToLocalChecked()));

    if(std::strcmp(*controlOperation, constants::postread) == 0) {
      ctrl->ldctl_oid = LDAP_CONTROL_POST_READ;
    } else if (std::strcmp(*controlOperation, constants::preread) == 0) {
      ctrl->ldctl_oid = LDAP_CONTROL_PRE_READ;
    } else {
      return std::vector<LDAPControl *>();
    }

    auto isCritical = v8::Local<v8::Number>::Cast(controls->Get(Nan::New("iscritical").ToLocalChecked()));
    int isC = isCritical->NumberValue();
    ctrl->ldctl_iscritical = isC;

  }

  return ctrls;
}

std::string LdapControls::PrintModificationControls (LDAP *ld, LDAPMessage *resultMsg) {
  struct berval bv;
  BerElement *ber;
  LDAPControl **serverCTL = NULL;
  BerVarray vals = NULL;
  std::string modifyResult = "";

  ldap_parse_result(ld, resultMsg, NULL, NULL, NULL, NULL, &serverCTL, 0);
  int i = 0;

  if(serverCTL == NULL) {
    return modifyResult;
  }
  while (serverCTL[i] != 0) {
    ber = ber_init(&serverCTL[i]->ldctl_value);
    if (ber == NULL) {
      std::cout << "ber is NULL" << std::endl;
      return modifyResult;
    } else if( ber_scanf(ber, "{m{" /*}}*/ , &bv) == LBER_ERROR) {
      std::cout << "BER error" << std::endl;
      return modifyResult;
    } else {
      modifyResult += "\n";
      modifyResult += "dn: ";
      modifyResult += bv.bv_val;
      while (ber_scanf(ber, "{m" /*}*/ , &bv) != LBER_ERROR) {
        if (ber_scanf(ber, "[W]", &vals) == LBER_ERROR || vals == NULL) {
          std::cout << "Vals error" << std::endl;
          return modifyResult;
        }
          modifyResult += "\n";
          modifyResult += bv.bv_val;
          modifyResult += ": ";
          modifyResult += vals[0].bv_val;
        }
        modifyResult += "\n";
      }
    i++;
  }
  ldap_controls_free(serverCTL);
  return modifyResult;
}