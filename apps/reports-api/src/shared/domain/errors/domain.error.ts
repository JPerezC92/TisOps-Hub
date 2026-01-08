export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static isDomainError(value: unknown): value is DomainError {
    return value instanceof DomainError;
  }
}
