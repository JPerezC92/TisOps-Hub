export interface RequestCategorization {
  id: number;
  category: string;
  technician: string;
  requestId: string;
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
