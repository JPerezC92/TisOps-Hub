export interface ErrorLog {
  id: number;
  timestamp: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorLogResponse {
  logs: ErrorLog[];
  total: number;
}
