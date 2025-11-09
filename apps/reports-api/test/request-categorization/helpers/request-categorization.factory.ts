import { faker } from '@faker-js/faker';
import { RequestCategorizationEntity } from '@request-categorization/domain/entities/request-categorization.entity';

export class RequestCategorizationFactory {
  static create(overrides?: Partial<{
    requestId: string;
    category: string;
    technician: string;
    createdTime: string;
    modulo: string;
    subject: string;
    problemId: string;
    linkedRequestId: string;
    requestIdLink: string;
    linkedRequestIdLink: string;
  }>): RequestCategorizationEntity {
    return RequestCategorizationEntity.create(
      overrides?.requestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      overrides?.category ?? faker.helpers.arrayElement(['Incident', 'Service Request', 'Change', 'Problem']),
      overrides?.technician ?? faker.person.fullName(),
      overrides?.createdTime ?? faker.date.recent().toISOString(),
      overrides?.modulo ?? faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Operations']),
      overrides?.subject ?? faker.lorem.sentence(),
      overrides?.problemId ?? `PROB${faker.string.alphanumeric(6).toUpperCase()}`,
      overrides?.linkedRequestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      overrides?.requestIdLink ?? (faker.datatype.boolean() ? faker.internet.url() : undefined),
      overrides?.linkedRequestIdLink ?? (faker.datatype.boolean() ? faker.internet.url() : undefined),
    );
  }

  static createMany(count: number, overrides?: Partial<{
    requestId: string;
    category: string;
    technician: string;
    createdTime: string;
    modulo: string;
    subject: string;
    problemId: string;
    linkedRequestId: string;
    requestIdLink: string;
    linkedRequestIdLink: string;
  }>): RequestCategorizationEntity[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createWithAdditionalInfo(overrides?: Partial<{
    requestId: string;
    category: string;
    technician: string;
    createdTime: string;
    modulo: string;
    subject: string;
    problemId: string;
    linkedRequestId: string;
    requestIdLink: string;
    linkedRequestIdLink: string;
    additionalInformation: string[];
    tagCategorizacion: string[];
  }>): {
    requestId: string;
    category: string;
    technician: string;
    createdTime: string;
    modulo: string;
    subject: string;
    problemId: string;
    linkedRequestId: string;
    requestIdLink?: string;
    linkedRequestIdLink?: string;
    additionalInformation: string[];
    tagCategorizacion: string[];
  } {
    return {
      requestId: overrides?.requestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      category: overrides?.category ?? faker.helpers.arrayElement(['Incident', 'Service Request', 'Change', 'Problem']),
      technician: overrides?.technician ?? faker.person.fullName(),
      createdTime: overrides?.createdTime ?? faker.date.recent().toISOString(),
      modulo: overrides?.modulo ?? faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Operations']),
      subject: overrides?.subject ?? faker.lorem.sentence(),
      problemId: overrides?.problemId ?? `PROB${faker.string.alphanumeric(6).toUpperCase()}`,
      linkedRequestId: overrides?.linkedRequestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      requestIdLink: overrides?.requestIdLink ?? (faker.datatype.boolean() ? faker.internet.url() : undefined),
      linkedRequestIdLink: overrides?.linkedRequestIdLink ?? (faker.datatype.boolean() ? faker.internet.url() : undefined),
      additionalInformation: overrides?.additionalInformation ?? faker.helpers.arrayElements(['Asignado', 'Pendiente', 'En Proceso', 'Resuelto'], { min: 0, max: 3 }),
      tagCategorizacion: overrides?.tagCategorizacion ?? faker.helpers.arrayElements(['Tag1', 'Tag2', 'Tag3'], { min: 0, max: 2 }),
    };
  }

  static createManyWithAdditionalInfo(count: number, overrides?: Partial<{
    requestId: string;
    category: string;
    technician: string;
    createdTime: string;
    modulo: string;
    subject: string;
    problemId: string;
    linkedRequestId: string;
    requestIdLink: string;
    linkedRequestIdLink: string;
    additionalInformation: string[];
    tagCategorizacion: string[];
  }>): Array<{
    requestId: string;
    category: string;
    technician: string;
    createdTime: string;
    modulo: string;
    subject: string;
    problemId: string;
    linkedRequestId: string;
    requestIdLink?: string;
    linkedRequestIdLink?: string;
    additionalInformation: string[];
    tagCategorizacion: string[];
  }> {
    return Array.from({ length: count }, () => this.createWithAdditionalInfo(overrides));
  }
}
