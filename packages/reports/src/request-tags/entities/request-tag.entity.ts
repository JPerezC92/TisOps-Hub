export interface RequestTag {
  requestId: string; // Primary key
  createdTime: string;
  informacionAdicional: string;
  modulo: string;
  problemId: string;
  linkedRequestId: string;
  jira: string;
  categorizacion: string;
  technician: string;
}

export interface RequestTagResponse {
  data: RequestTag[];
  total: number;
}
