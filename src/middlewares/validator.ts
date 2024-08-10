import { NextFunction, Request, Response } from 'express';
import { validateOrReject, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

const validateRequest = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body);

    try {
      await validateOrReject(dtoInstance);
      req.body = dtoInstance; // Replace req.body with validated data
      next();
    } catch (errors) {
      const formattedErrors = (errors as ValidationError[]).map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));
      res.status(400).json({ errors: formattedErrors });
    }
  };
};

export default validateRequest;
