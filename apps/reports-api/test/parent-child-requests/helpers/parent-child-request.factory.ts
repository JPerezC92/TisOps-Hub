import { faker } from '@faker-js/faker';
import { ParentChildRequest } from '@parent-child-requests/domain/entities/parent-child-request.entity';

export class ParentChildRequestFactory {
  static create(overrides?: Partial<{
    id: number;
    requestId: string;
    linkedRequestId: string;
    requestIdLink: string | null;
    linkedRequestIdLink: string | null;
  }>): ParentChildRequest {
    return new ParentChildRequest(
      overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      overrides?.requestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      overrides?.linkedRequestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      overrides?.requestIdLink ?? (faker.datatype.boolean() ? faker.internet.url() : null),
      overrides?.linkedRequestIdLink ?? (faker.datatype.boolean() ? faker.internet.url() : null),
    );
  }

  static createMany(count: number, overrides?: Partial<{
    id: number;
    requestId: string;
    linkedRequestId: string;
    requestIdLink: string | null;
    linkedRequestIdLink: string | null;
  }>): ParentChildRequest[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }

  static createData(overrides?: Partial<{
    requestId: string;
    linkedRequestId: string;
    requestIdLink: string;
    linkedRequestIdLink: string;
  }>): {
    requestId: string;
    linkedRequestId: string;
    requestIdLink?: string;
    linkedRequestIdLink?: string;
  } {
    const data: any = {
      requestId: overrides?.requestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      linkedRequestId: overrides?.linkedRequestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
    };

    if (overrides?.requestIdLink !== undefined) {
      data.requestIdLink = overrides.requestIdLink;
    }

    if (overrides?.linkedRequestIdLink !== undefined) {
      data.linkedRequestIdLink = overrides.linkedRequestIdLink;
    }

    return data;
  }

  static createManyData(count: number, overrides?: Partial<{
    requestId: string;
    linkedRequestId: string;
    requestIdLink: string;
    linkedRequestIdLink: string;
  }>): Array<{
    requestId: string;
    linkedRequestId: string;
    requestIdLink?: string;
    linkedRequestIdLink?: string;
  }> {
    return Array.from({ length: count }, () => this.createData(overrides));
  }
}
