declare class ValidationError extends Error {

  constructor(message:string, error:any, errors:Array<any>);

}

export = ValidationError;
