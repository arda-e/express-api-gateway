import { Response } from "express";

import { ApiResponse } from "../../../utils/Response";

/**
 * Handles the response based on the result
 */
export function handleResponse(result: any, res: Response): void {
  if (result instanceof ApiResponse) {
    res.status(result.statusCode).json({
      data: result.data,
      message: result.message,
    });
  } else if (!res.headersSent) {
    res.status(200).json({
      data: result,
      message: "Success",
    });
  }
}
