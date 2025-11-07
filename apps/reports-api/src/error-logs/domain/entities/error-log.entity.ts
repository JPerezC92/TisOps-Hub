export interface ErrorLogProps {
  id?: number;
  timestamp: Date;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class ErrorLog {
  constructor(private readonly props: ErrorLogProps) {}

  get id(): number | undefined {
    return this.props.id;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get errorType(): string {
    return this.props.errorType;
  }

  get errorMessage(): string {
    return this.props.errorMessage;
  }

  get stackTrace(): string | undefined {
    return this.props.stackTrace;
  }

  get endpoint(): string | undefined {
    return this.props.endpoint;
  }

  get method(): string | undefined {
    return this.props.method;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      errorType: this.errorType,
      errorMessage: this.errorMessage,
      stackTrace: this.stackTrace,
      endpoint: this.endpoint,
      method: this.method,
      userId: this.userId,
      metadata: this.metadata,
    };
  }
}
