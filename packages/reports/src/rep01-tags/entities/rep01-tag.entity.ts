export interface Rep01Tag {
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

export interface Rep01TagResponse {
  data: Rep01Tag[];
  total: number;
}
