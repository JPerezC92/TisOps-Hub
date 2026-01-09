import { faker } from '@faker-js/faker';
import type { ErrorLog } from '@repo/reports/frontend';

const ERROR_TYPES = [
  'DatabaseError',
  'ValidationError',
  'AuthenticationError',
  'NetworkError',
  'InternalServerError',
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export class ErrorLogFactory {
  static create(overrides?: Partial<ErrorLog>): ErrorLog {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      timestamp:
        overrides?.timestamp ?? faker.date.recent().toISOString(),
      errorType:
        overrides?.errorType ?? faker.helpers.arrayElement(ERROR_TYPES),
      errorMessage:
        overrides?.errorMessage ?? faker.lorem.sentence(),
      stackTrace:
        overrides?.stackTrace ??
        faker.helpers.maybe(() => faker.lorem.paragraphs(2), { probability: 0.7 }),
      endpoint:
        overrides?.endpoint ??
        faker.helpers.maybe(
          () => `/api/${faker.word.noun()}/${faker.string.uuid()}`,
          { probability: 0.8 }
        ),
      method:
        overrides?.method ??
        faker.helpers.maybe(
          () => faker.helpers.arrayElement(HTTP_METHODS),
          { probability: 0.8 }
        ),
      userId:
        overrides?.userId ??
        faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.5 }),
      metadata:
        overrides?.metadata ??
        faker.helpers.maybe(
          () => ({
            userAgent: faker.internet.userAgent(),
            ip: faker.internet.ip(),
          }),
          { probability: 0.5 }
        ),
    };
  }

  static createMany(count: number, overrides?: Partial<ErrorLog>): ErrorLog[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createDatabaseError(overrides?: Partial<ErrorLog>): ErrorLog {
    return this.create({
      errorType: 'DatabaseError',
      errorMessage: 'Connection to database failed',
      ...overrides,
    });
  }

  static createRecentError(overrides?: Partial<ErrorLog>): ErrorLog {
    return this.create({
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      ...overrides,
    });
  }
}
