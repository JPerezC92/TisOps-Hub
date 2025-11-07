export class RequestCategorizationEntity {
  constructor(
    private readonly requestId: string,
    private readonly category: string,
    private readonly technician: string,
    private readonly createdTime: string,
    private readonly modulo: string,
    private readonly subject: string,
    private readonly problemId: string,
    private readonly linkedRequestId: string,
    private readonly requestIdLink?: string,
    private readonly linkedRequestIdLink?: string,
  ) {}

  static create(
    requestId: string,
    category: string,
    technician: string,
    createdTime: string,
    modulo: string,
    subject: string,
    problemId: string,
    linkedRequestId: string,
    requestIdLink?: string,
    linkedRequestIdLink?: string,
  ): RequestCategorizationEntity {
    return new RequestCategorizationEntity(
      requestId,
      category,
      technician,
      createdTime,
      modulo,
      subject,
      problemId,
      linkedRequestId,
      requestIdLink,
      linkedRequestIdLink,
    );
  }

  getRequestId(): string {
    return this.requestId;
  }

  getCategory(): string {
    return this.category;
  }

  getTechnician(): string {
    return this.technician;
  }

  getCreatedTime(): string {
    return this.createdTime;
  }

  getModulo(): string {
    return this.modulo;
  }

  getSubject(): string {
    return this.subject;
  }

  getProblemId(): string {
    return this.problemId;
  }

  getLinkedRequestId(): string {
    return this.linkedRequestId;
  }

  getRequestIdLink(): string | undefined {
    return this.requestIdLink;
  }

  getLinkedRequestIdLink(): string | undefined {
    return this.linkedRequestIdLink;
  }
}
