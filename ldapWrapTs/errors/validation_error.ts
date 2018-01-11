export default class ValidationError extends Error {

  error:Array<any>;
  
  constructor(message:string, error:any, errors:Array<any> | undefined) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.error = error || errors;
  }

}

