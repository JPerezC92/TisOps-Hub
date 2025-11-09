import { faker } from '@faker-js/faker';
import { ErrorLog, ErrorLogProps } from '@error-logs/domain/entities/error-log.entity';

export class ErrorLogFactory {
  static create(overrides?: Partial<ErrorLogProps>): ErrorLog {
    const props: ErrorLogProps = {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      timestamp: overrides?.timestamp ?? faker.date.recent(),
      errorType: overrides?.errorType ?? faker.helpers.arrayElement(['TypeError', 'ReferenceError', 'DatabaseError', 'ValidationError', 'NetworkError']),
      errorMessage: overrides?.errorMessage ?? faker.lorem.sentence(),
      stackTrace: overrides?.stackTrace ?? (faker.datatype.boolean() ? faker.lorem.paragraph() : undefined),
      endpoint: overrides?.endpoint ?? (faker.datatype.boolean() ? `/api/${faker.lorem.word()}` : undefined),
      method: overrides?.method ?? (faker.datatype.boolean() ? faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) : undefined),
      userId: overrides?.userId ?? (faker.datatype.boolean() ? faker.string.uuid() : undefined),
      metadata: overrides?.metadata ?? (faker.datatype.boolean() ? { key: faker.lorem.word(), value: faker.lorem.word() } : undefined),
    };

    return new ErrorLog(props);
  }

  static createMany(count: number, overrides?: Partial<ErrorLogProps>): ErrorLog[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }
}
