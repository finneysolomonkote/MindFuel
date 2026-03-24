export class ApiResponse<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: {
      code: string;
      message: string;
      details?: any;
    }
  ) {}

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse(true, data);
  }

  static error(code: string, message: string, details?: any): ApiResponse {
    return new ApiResponse(false, undefined, { code, message, details });
  }
}
