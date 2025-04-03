class CustomError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
export default CustomError;
  
  // Usage example:
  // import CustomError from '@/lib/custom-error';
  // 
  // throw new CustomError('User not found', 404);