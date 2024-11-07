import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError as ClassValidatorError } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import { ResponseBuilder } from '@utils/ResponseBuilder';

/**
 * Middleware function that validates the request body using a provided DTO class.
 *
 * @param dtoClass - The DTO class to use for validation.
 * @returns A middleware function that can be used in an Express route.
 */
const validateRequest = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body) as any;

    try {
      await validateOrReject(dtoInstance);
      req.body = dtoInstance; // Replace req.body with validated data
      next();
    } catch (errors) {
      /**
       * Formats the validation errors returned from the `class-validator` library into a more
       * structured format that can be returned in the response.
       *
       * @param errors - The validation errors returned from `class-validator`.
       * @returns An array of objects, where each object has a `field` property with the
       * name of the field that failed validation, and an `errors` property with an array
       * of the error messages for that field.
       */
      const formattedErrors = (errors as ClassValidatorError[]).map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));

      const errorResponse = new ResponseBuilder()
        .setStatus('error')
        .setStatusCode(StatusCodes.BAD_REQUEST)
        .setMessage('Validation failed')
        .setErrors(formattedErrors)
        .build();

      res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }
  };
};

export default validateRequest;
