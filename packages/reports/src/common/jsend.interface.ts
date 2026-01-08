export interface JSendSuccess<T> {
  status: 'success';
  data: T;
}

export interface JSendFail<T> {
  status: 'fail';
  data: T;
}

export interface JSendError {
  status: 'error';
  message: string;
  code?: string;
  data?: unknown;
}

export type JSendResponse<T> = JSendSuccess<T> | JSendFail<T> | JSendError;
