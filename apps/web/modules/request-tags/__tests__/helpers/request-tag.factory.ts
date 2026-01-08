import { faker } from '@faker-js/faker';
import type { RequestTag } from '@repo/reports/frontend';

export class RequestTagFactory {
  static create(overrides?: Partial<RequestTag>): RequestTag {
    return {
      requestId: overrides?.requestId ?? `REQ-${faker.string.alphanumeric(6).toUpperCase()}`,
      createdTime: overrides?.createdTime ?? faker.date.recent().toISOString().split('T')[0]!,
      informacionAdicional: overrides?.informacionAdicional ?? faker.lorem.sentence(),
      modulo: overrides?.modulo ?? faker.helpers.arrayElement(['Finanzas', 'Recursos Humanos', 'Ventas', 'Operaciones']),
      problemId: overrides?.problemId ?? `PRB-${faker.string.alphanumeric(6).toUpperCase()}`,
      linkedRequestId: overrides?.linkedRequestId ?? faker.helpers.arrayElement([`REQ-${faker.string.alphanumeric(6).toUpperCase()}`, 'No asignado']),
      jira: overrides?.jira ?? faker.helpers.arrayElement([`JIRA-${faker.number.int({ min: 100, max: 999 })}`, 'No asignado']),
      categorizacion: overrides?.categorizacion ?? faker.helpers.arrayElement(['Bug', 'Feature', 'Support', 'No asignado']),
      technician: overrides?.technician ?? faker.person.fullName(),
    };
  }

  static createMany(count: number, overrides?: Partial<RequestTag>): RequestTag[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
