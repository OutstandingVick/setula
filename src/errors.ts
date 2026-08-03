export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT") {
    super(message, 409, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Invalid payout callback secret") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class InsufficientBalanceError extends Error {
  readonly code = "INSUFFICIENT_USDC_BALANCE";

  constructor(message: string) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}
