declare class ValidationError extends Error {

  constructor(message:string, error:string, errors:Array<string>);

}

export = ValidationError;
