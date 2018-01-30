import { ErrorObject } from 'ajv';

export default class ValidationError extends Error {

  error: Error | ErrorObject[] | undefined;

  constructor(message: string, error: Error | undefined ,errors: ErrorObject[] | undefined) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.error = error || errors;
  }

}

