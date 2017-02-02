#include <nan.h>
#include <stdio.h>
#include <iostream>

void Method(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  info.GetReturnValue().Set(Nan::New("world").ToLocalChecked());
}

void Init(v8::Local<v8::Object> exports) {
  exports->Set(Nan::New("hello").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(Method)->GetFunction());
}

class MyObject : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("MyObject").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "getHandle", GetHandle);
    Nan::SetPrototypeMethod(tpl, "getValue", GetValue);

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(target, Nan::New("MyObject").ToLocalChecked(),
      Nan::GetFunction(tpl).ToLocalChecked());
  }

 protected:
   virtual void Unref()
   {
	   std::cout << "Unref" << value_ << std::endl;
   }   
 private:
  explicit MyObject(double value = 0) : value_(value) {}
  ~MyObject() {
	  std::cout << "Destruct" << value_ << std::endl;
  }

  static NAN_METHOD(New) {
    if (info.IsConstructCall()) {
      double value = info[0]->IsUndefined() ? 0 : Nan::To<double>(info[0]).FromJust();
      MyObject *obj = new MyObject(value);
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      const int argc = 1;
      v8::Local<v8::Value> argv[argc] = {info[0]};
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(cons->NewInstance(argc, argv));
    }
  }

  static NAN_METHOD(GetHandle) {
    MyObject* obj = Nan::ObjectWrap::Unwrap<MyObject>(info.Holder());
    info.GetReturnValue().Set(obj->handle());
  }

  static NAN_METHOD(GetValue) {
    MyObject* obj = Nan::ObjectWrap::Unwrap<MyObject>(info.Holder());
    info.GetReturnValue().Set(obj->value_);
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

  double value_;
};

NODE_MODULE(objectwrapper, MyObject::Init)


