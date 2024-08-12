import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ResponseFactory } from '@utils/responses/ResponseFactory';
import { Request, Response, NextFunction } from 'express';
import { ValidationError as ClassValidatorError } from 'class-validator';
const validateRequest = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body) as any;

    try {
      await validateOrReject(dtoInstance);
      req.body = dtoInstance; // Replace req.body with validated data
      next();
    } catch (errors) {
      const formattedErrors = (errors as ClassValidatorError[]).map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));
      const errorResponse = ResponseFactory.createBadRequestResponse('Validation failed');
      errorResponse.errors = formattedErrors;
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
};

export default validateRequest;
