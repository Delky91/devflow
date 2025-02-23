/**
 * Represents an error that occurs during an HTTP request.
 * Extends the built-in `Error` class to include additional properties.
 */
export class RequestError extends Error {
   /**
    * The HTTP status code associated with the error.
    */
   statusCode: number;

   /**
    * Optional detailed errors, represented as a record where the key is a string
    * and the value is an array of strings.
    */
   errors?: Record<string, string[]>;

   /**
    * Creates an instance of `RequestError`.
    * @param statusCode - The HTTP status code associated with the error.
    * @param message - A descriptive error message.
    * @param errors - Optional detailed errors.
    */
   constructor(
      statusCode: number,
      message: string,
      errors?: Record<string, string[]>
   ) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      this.name = "RequestError";
   }
}

/**
 * Represents a validation error that occurs during a request.
 * Extends the `RequestError` class.
 */
export class ValidationError extends RequestError {
   /**
    * Creates an instance of `ValidationError`.
    * @param fieldErrors - An object containing field names as keys and an array of error messages as values.
    */
   constructor(fieldErrors: Record<string, string[]>) {
      const message = ValidationError.formatFieldErrors(fieldErrors);
      super(400, message, fieldErrors);
      this.name = "ValidationError";
      this.errors = fieldErrors;
   }

   /**
    * Formats the field errors into a single string message.
    * @param errors - An object containing field names as keys and an array of error messages as values.
    * @returns A formatted string message representing the field errors.
    */
   static formatFieldErrors(errors: Record<string, string[]>): string {
      const formatedMessages = Object.entries(errors).map(
         ([field, messages]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

            if (messages[0] === "required") {
               return `${fieldName} is required`;
            } else {
               return messages.join(" and ");
            }
         }
      );
      return formatedMessages.join(", ");
   }
}

/**
 * Represents an error that occurs when a requested resource is not found.
 * Extends the `RequestError` class.
 */
export class NotFoundError extends RequestError {
   /**
    * Creates an instance of NotFoundError.
    *
    * @param resource - The name of the resource that was not found.
    */
   constructor(resource: string) {
      super(404, `${resource} not found`);
      this.name = "NotFoundError";
   }
}

/**
 * Represents an error when a request is forbidden.
 * This error is typically used to indicate that the client does not have permission to access the requested resource.
 *
 * @extends {RequestError}
 */
export class ForbiddenError extends RequestError {
   /**
    * Creates an instance of ForbiddenError.
    *
    * @param message - The error message to be displayed. Defaults to "Forbidden".
    */
   constructor(message: string = "Forbidden") {
      super(403, message);
      this.name = "ForbiddenError";
   }
}

/**
 * Represents an error when a request is unauthorized.
 * This error is typically used to indicate that the client must authenticate itself to get the requested response.
 */
export class UnauthorizedError extends RequestError {
   /**
    * Creates an instance of UnauthorizedError.
    *
    * @param message - The error message to be displayed. Defaults to "Unauthorized".
    */
   constructor(message: string = "Unauthorized") {
      super(401, message);
      this.name = "UnauthorizedError";
   }
}
