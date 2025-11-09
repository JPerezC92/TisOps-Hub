import { faker } from '@faker-js/faker';
import { RequestTag } from '@request-tags/domain/entities/request-tag.entity';

export class RequestTagFactory {
  static create(overrides?: Partial<{
    requestId: string;
    requestIdLink: string;
    createdTime: string;
    informacionAdicional: string;
    modulo: string;
    problemId: string;
    linkedRequestId: string;
    linkedRequestIdLink: string;
    jira: string;
    categorizacion: string;
    technician: string;
  }>): RequestTag {
    const hasRequestIdLink = overrides && 'requestIdLink' in overrides;
    const hasLinkedRequestIdLink = overrides && 'linkedRequestIdLink' in overrides;

    return RequestTag.create({
      requestId: overrides?.requestId ?? `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
      requestIdLink: hasRequestIdLink ? overrides.requestIdLink : (faker.datatype.boolean() ? faker.internet.url() : undefined),
      createdTime: overrides?.createdTime ?? faker.date.recent().toISOString(),
      informacionAdicional: overrides?.informacionAdicional ?? faker.helpers.arrayElement(['Asignado', 'No asignado', 'Pendiente']),
      modulo: overrides?.modulo ?? faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Operations']),
      problemId: overrides?.problemId ?? `PROB${faker.string.alphanumeric(6).toUpperCase()}`,
      linkedRequestId: overrides?.linkedRequestId ?? faker.helpers.arrayElement([`REQ${faker.string.alphanumeric(6).toUpperCase()}`, 'No asignado']),
      linkedRequestIdLink: hasLinkedRequestIdLink ? overrides.linkedRequestIdLink : (faker.datatype.boolean() ? faker.internet.url() : undefined),
      jira: overrides?.jira ?? faker.helpers.arrayElement([`JIRA-${faker.number.int({ min: 100, max: 999 })}`, 'No asignado']),
      categorizacion: overrides?.categorizacion ?? faker.helpers.arrayElement(['Incident', 'Service Request', 'Change', 'No asignado']),
      technician: overrides?.technician ?? faker.person.fullName(),
    });
  }

  static createMany(count: number, overrides?: Partial<{
    requestId: string;
    requestIdLink: string;
    createdTime: string;
    informacionAdicional: string;
    modulo: string;
    problemId: string;
    linkedRequestId: string;
    linkedRequestIdLink: string;
    jira: string;
    categorizacion: string;
    technician: string;
  }>): RequestTag[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
