export class ParentChildRequest {
  constructor(
    public readonly id: number,
    public readonly requestId: string,
    public readonly linkedRequestId: string,
    public readonly requestIdLink: string | null,
    public readonly linkedRequestIdLink: string | null,
  ) {}

  static create(data: {
    id: number;
    requestId: string;
    linkedRequestId: string;
    requestIdLink?: string | null;
    linkedRequestIdLink?: string | null;
  }): ParentChildRequest {
    return new ParentChildRequest(
      data.id,
      data.requestId,
      data.linkedRequestId,
      data.requestIdLink ?? null,
      data.linkedRequestIdLink ?? null,
    );
  }
}
