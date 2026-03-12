import { faker } from '@faker-js/faker';
import type { AppRegistryWithPatterns, AppRegistryApplicationResponse, AppRegistryPatternResponse } from '@repo/reports/frontend';

const APP_CODES = ['CD', 'FFVV', 'SB', 'UNETE', 'CRM', 'ERP'] as const;

export class ApplicationFactory {
  static create(overrides?: Partial<AppRegistryWithPatterns>): AppRegistryWithPatterns {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      code: overrides?.code ?? faker.helpers.arrayElement([...APP_CODES]),
      name: overrides?.name ?? faker.company.name(),
      description: overrides?.description ?? faker.lorem.sentence(),
      isActive: overrides?.isActive ?? true,
      createdAt: overrides?.createdAt ?? faker.date.recent().toISOString(),
      updatedAt: overrides?.updatedAt ?? faker.date.recent().toISOString(),
      patterns: overrides?.patterns ?? [],
    };
  }

  static createMany(count: number, overrides?: Partial<AppRegistryWithPatterns>): AppRegistryWithPatterns[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createWithPatterns(
    patternCount: number,
    overrides?: Partial<AppRegistryWithPatterns>,
  ): AppRegistryWithPatterns {
    const appId = overrides?.id ?? faker.number.int({ min: 1, max: 1000 });
    return this.create({
      ...overrides,
      id: appId,
      patterns: Array.from({ length: patternCount }, (_, i) =>
        this.createPattern({ applicationId: appId, priority: (i + 1) * 10 }),
      ),
    });
  }

  static createApplication(overrides?: Partial<AppRegistryApplicationResponse>): AppRegistryApplicationResponse {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      code: overrides?.code ?? faker.helpers.arrayElement([...APP_CODES]),
      name: overrides?.name ?? faker.company.name(),
      description: overrides?.description ?? faker.lorem.sentence(),
      isActive: overrides?.isActive ?? true,
      createdAt: overrides?.createdAt ?? faker.date.recent().toISOString(),
      updatedAt: overrides?.updatedAt ?? faker.date.recent().toISOString(),
    };
  }

  static createPattern(overrides?: Partial<AppRegistryPatternResponse>): AppRegistryPatternResponse {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      applicationId: overrides?.applicationId ?? faker.number.int({ min: 1, max: 100 }),
      pattern: overrides?.pattern ?? faker.lorem.words(2),
      priority: overrides?.priority ?? faker.number.int({ min: 1, max: 100 }),
      matchType: overrides?.matchType ?? 'contains',
      isActive: overrides?.isActive ?? true,
    };
  }
}
