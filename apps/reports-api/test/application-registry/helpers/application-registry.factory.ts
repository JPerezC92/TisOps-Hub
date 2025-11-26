import { faker } from '@faker-js/faker';
import { Application } from '@application-registry/domain/entities/application.entity';
import { ApplicationPattern } from '@application-registry/domain/entities/application-pattern.entity';
import type { ApplicationWithPatterns } from '@application-registry/domain/repositories/application-registry.repository.interface';

export class ApplicationFactory {
  static create(overrides?: Partial<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>): Application {
    return new Application(
      overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      overrides?.code ?? faker.string.alphanumeric(4).toUpperCase(),
      overrides?.name ?? faker.company.name(),
      overrides?.description ?? (faker.datatype.boolean() ? faker.lorem.sentence() : null),
      overrides?.isActive ?? true,
      overrides?.createdAt ?? faker.date.recent(),
      overrides?.updatedAt ?? faker.date.recent(),
    );
  }

  static createMany(count: number, overrides?: Partial<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>): Application[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }
}

export class ApplicationPatternFactory {
  static create(overrides?: Partial<{
    id: number;
    applicationId: number;
    pattern: string;
    priority: number;
    matchType: string;
    isActive: boolean;
  }>): ApplicationPattern {
    return new ApplicationPattern(
      overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      overrides?.applicationId ?? faker.number.int({ min: 1, max: 100 }),
      overrides?.pattern ?? faker.company.name().toLowerCase(),
      overrides?.priority ?? faker.number.int({ min: 1, max: 10 }),
      overrides?.matchType ?? 'contains',
      overrides?.isActive ?? true,
    );
  }

  static createMany(count: number, overrides?: Partial<{
    id: number;
    applicationId: number;
    pattern: string;
    priority: number;
    matchType: string;
    isActive: boolean;
  }>): ApplicationPattern[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }
}

export class ApplicationWithPatternsFactory {
  static create(overrides?: Partial<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    patterns: ApplicationPattern[];
  }>): ApplicationWithPatterns {
    const app = ApplicationFactory.create(overrides);
    return {
      ...app,
      patterns: overrides?.patterns ?? ApplicationPatternFactory.createMany(2, { applicationId: app.id }),
    };
  }

  static createMany(count: number, overrides?: Partial<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    patterns: ApplicationPattern[];
  }>): ApplicationWithPatterns[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }
}
