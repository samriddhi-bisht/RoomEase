// A predictable error we throw on purpose (e.g. "listing not found", "email
// already registered") vs. an unexpected bug. errorHandler.js uses
// `isOperational` to decide whether to show the message to the user or hide
// it behind a generic "something went wrong".
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
