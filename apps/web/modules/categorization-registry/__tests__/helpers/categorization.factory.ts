import { faker } from '@faker-js/faker';
import type { Categorization } from '../../services/categorization-registry.service';

export class CategorizationFactory {
  static create(overrides?: Partial<Categorization>): Categorization {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      sourceValue: overrides?.sourceValue ?? faker.lorem.words(3),
      displayValue: overrides?.displayValue ?? faker.lorem.word(),
      isActive: overrides?.isActive ?? true,
      createdAt: overrides?.createdAt ?? faker.date.recent().toISOString(),
      updatedAt: overrides?.updatedAt ?? faker.date.recent().toISOString(),
    };
  }

  static createMany(count: number, overrides?: Partial<Categorization>): Categorization[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
