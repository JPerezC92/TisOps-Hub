export class Rep01Tag {
  constructor(
    public readonly requestId: string, // Request ID is now the primary key
    public readonly requestIdLink: string | undefined,
    public readonly createdTime: string,
    public readonly informacionAdicional: string,
    public readonly modulo: string,
    public readonly problemId: string,
    public readonly linkedRequestId: string,
    public readonly linkedRequestIdLink: string | undefined,
    public readonly jira: string,
    public readonly categorizacion: string,
    public readonly technician: string,
  ) {}

  static create(props: {
    requestId: string;
    requestIdLink?: string;
    createdTime: string;
    informacionAdicional: string;
    modulo: string;
    problemId: string;
    linkedRequestId: string;
    linkedRequestIdLink?: string;
    jira: string;
    categorizacion: string;
    technician: string;
  }): Rep01Tag {
    return new Rep01Tag(
      props.requestId,
      props.requestIdLink,
      props.createdTime,
      props.informacionAdicional,
      props.modulo,
      props.problemId,
      props.linkedRequestId,
      props.linkedRequestIdLink,
      props.jira,
      props.categorizacion,
      props.technician,
    );
  }

  isAssigned(): boolean {
    return this.informacionAdicional !== 'No asignado';
  }

  hasJiraTicket(): boolean {
    return this.jira !== 'No asignado';
  }

  isCategorized(): boolean {
    return this.categorizacion !== 'No asignado';
  }

  hasLinkedRequest(): boolean {
    return this.linkedRequestId !== 'No asignado';
  }
}
