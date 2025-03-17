import ApiResponse from '../utils/ApiResponse';
import { BaseError } from '../utils/error';
import { Response } from 'express';
class ErrorHandler {
  public static handleErrors(err: Error, res: Response): void {
    res.status(500).json(new ApiResponse(500, 'Internal Server Error'));
    console.error(err);
  }
  public static isTrustedError(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isOperational;
    }
    return false;
  }
}

export default ErrorHandler;
