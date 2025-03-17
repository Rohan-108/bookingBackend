import { HttpStatusCode } from '../types/httpCode';

class ApiResponse {
  public readonly statusCode: HttpStatusCode;
  public readonly data: any;
  public readonly message: string;
  public readonly success: boolean;
  constructor(statusCode: HttpStatusCode, data: any, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
export default ApiResponse;
