export interface RequestCategorization {
  requestId: string; // Primary key - unique identifier
  category: string;
  technician: string;
  requestIdLink?: string;
  createdTime: string;
  modulo: string;
  subject: string;
  problemId: string;
  linkedRequestId: string;
  linkedRequestIdLink?: string;
}

export interface RequestCategorizationResponse {
  data: RequestCategorization[];
  total: number;
}

export interface CategorySummary {
  category: string;
  count: number;
}
